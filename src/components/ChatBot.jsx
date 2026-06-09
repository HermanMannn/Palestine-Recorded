import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Sparkles,
  Send,
  X,
  Trash2,
  ExternalLink,
  Loader2,
  MessageCircleQuestion,
} from "lucide-react";
import { callDeepSeek, MISSING_DEEPSEEK_API_KEY_ERROR } from "../services/deepseekService";
import { searchWikipedia } from "../services/wikipediaService";
import { renderMarkdown } from "../utils/markdownParser.jsx";
import { timelineData } from "./TimelineSidebar.jsx";
import { useTranslation } from "@/hooks/useTranslation";

// ===== CONSTANTS =====

const CONVERSATION_STARTERS = [
  "Tell me about Palestinian independence movements",
  "What are the key historical events in Palestine?",
  "Explain the history of Jerusalem",
];

const COMMON_QUERY_WORDS = new Set([
  "about", "could", "explain", "give", "history", "info", "information",
  "into", "please", "tell", "that", "the", "this", "what", "when",
  "where", "with", "would", "you",
]);

const INITIAL_MESSAGE = {
  id: 1,
  text: "Hello! I'm your Palestine history guide. Ask me anything about Palestinian history, culture, or events.",
  sender: "bot",
  sources: [],
};

const STORAGE_KEY = "palrec_chat_history";

const SYSTEM_PROMPT_BASE = [
  "You are a friendly Palestine history guide, not a textbook.",
  "Answer with warmth, curiosity, and a little personality while staying factual and respectful.",
  "Keep replies easy to skim: start with the most interesting takeaway, then add 2-4 short points if useful.",
  "Avoid long info dumps unless the user asks for detail.",
  "Use simple language and define heavy historical terms briefly.",
  "Use 1-3 relevant emojis where they feel natural, but do not overdo it.",
  "If the topic is violent, tragic, or politically sensitive, keep the tone thoughtful rather than playful.",
  "If the user asks a general question like 'tell me about history', interpret it as Palestinian history.",
].join(" ");

// ===== HELPER FUNCTIONS =====

// Clean up query by removing common filler words and punctuation
const cleanSearchQuery = (query) =>
  query
    .replace(/[?!.,]/g, " ")
    .replace(/\b(can you|could you|please|tell me about|tell me|explain|what is|what was|who is|who was|give me|information about)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim() || query;

// Normalize text for comparison
const normalizeText = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Extract meaningful query terms
const getQueryTerms = (query) =>
  normalizeText(cleanSearchQuery(query))
    .split(" ")
    .filter((word) => word.length > 2 && !COMMON_QUERY_WORDS.has(word));

// Search timeline data for relevant events
const getTimelineSources = (query) => {
  const queryTerms = getQueryTerms(query);
  if (queryTerms.length === 0) return { context: "", sources: [] };

  const matches = [];

  for (const yearGroup of timelineData) {
    for (const monthGroup of yearGroup.months) {
      for (const event of monthGroup.events) {
        const articleText = (event.articles || [])
          .map((article) => `${article.title} ${article.url}`)
          .join(" ");
        const eventText = normalizeText(
          [event.title, event.description, event.location, event.category, ...(event.tags || []), articleText].join(" ")
        );

        const matchCount = queryTerms.reduce((total, term) => total + (eventText.includes(term) ? 1 : 0), 0);
        if (matchCount === 0) continue;

        matches.push({ event, matchCount, year: yearGroup.year, month: monthGroup.month });
      }
    }
  }

  // Sort by relevance and extract top matches
  const topMatches = matches
    .sort((a, b) => b.matchCount - a.matchCount)
    .filter((match) => match.matchCount >= Math.min(2, queryTerms.length))
    .slice(0, 3);

  const sources = topMatches.flatMap((match) => (match.event.articles || []).map((article) => article.url));
  const context = topMatches
    .map((match) => `- ${match.event.title} (${match.month} ${match.year}): ${match.event.description}`)
    .join("\n");

  return { context, sources: [...new Set(sources)] };
};

// Merge and deduplicate source arrays
const mergeSources = (...sourceGroups) => [...new Set(sourceGroups.flat().filter(Boolean))];

const getDeepSeekErrorMessage = (error, fallback) =>
  error?.message === MISSING_DEEPSEEK_API_KEY_ERROR
    ? "AI is not configured yet. Add VITE_DEEPSEEK_API_KEY to your .env file, then restart the dev server."
    : fallback;

// Format source URL for display
const getSourceDisplayName = (source) => {
  if (!source.startsWith("http")) return "Wikipedia";

  const wikiTitle = source.split("/wiki/")[1];
  if (!wikiTitle) return "Wikipedia";

  try {
    return decodeURIComponent(wikiTitle).replace(/_/g, " ");
  } catch {
    return wikiTitle.replace(/_/g, " ");
  }
};

// Verify if user message is Palestine-related using AI classifier
const checkIfPalestineRelated = async (userMessage) => {
  try {
    const response = await callDeepSeek([
      {
        role: "system",
        content:
          "You are a topic classifier. Respond with ONLY 'yes' or 'no'. Determine if the user's message COULD be about Palestine or could be interpreted as asking about Palestine. Accept if: (1) it's directly about Palestine/Middle East/history/culture/politics, (2) it's a general query (like 'tell me about history') that could apply to Palestine, (3) it's about related topics like conflicts, independence, etc. Reject only if it's clearly about something unrelated (like toys, animals, sports). Be lenient with vague or general queries.",
      },
      { role: "user", content: userMessage },
    ]);

    return response.toLowerCase().includes("yes");
  } catch (error) {
    console.error("Error checking topic:", error);
    return true; // Allow message through on error to be safe
  }
};

// Load persisted chat (survives navigation between pages)
const loadPersistedMessages = () => {
  if (typeof window === "undefined") return [INITIAL_MESSAGE];
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {
    /* ignore corrupt state */
  }
  return [INITIAL_MESSAGE];
};

// ===== MAIN COMPONENT =====

const ChatBot = forwardRef(function ChatBot(props, ref) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(loadPersistedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isEmptyChat = messages.length === 1;

  // Persist conversation across page navigation
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full or unavailable */
    }
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  // Core send pipeline: validate topic, gather context, ask the model
  const submitQuestion = async (rawText, baseMessages) => {
    const userMessage = rawText.trim();
    if (!userMessage || isLoading) return;

    const history = baseMessages || messages;
    const newMessages = [
      ...history,
      { id: history.length + 1, text: userMessage, sender: "user" },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    // Check if message is about Palestine
    const isRelated = await checkIfPalestineRelated(userMessage);
    if (!isRelated) {
      setMessages([
        ...newMessages,
        {
          id: newMessages.length + 1,
          text: "I'm specifically designed to help with questions about Palestinian history, culture, and events. Could you ask me something related to Palestine? For example, you could ask about Palestinian independence movements, historical events, or the history of Jerusalem.",
          sender: "bot",
          sources: [],
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      // Gather context from timeline and Wikipedia
      const timelineResult = getTimelineSources(userMessage);
      const wikiResult = await searchWikipedia(cleanSearchQuery(userMessage));
      const sources = mergeSources(timelineResult.sources, wikiResult.sources);

      // Build system prompt with available context
      let systemPrompt = SYSTEM_PROMPT_BASE;
      if (timelineResult.context) {
        systemPrompt += `\n\nRelevant timeline events and linked sources:\n${timelineResult.context}`;
      }
      if (wikiResult.context) {
        systemPrompt += `\n\nRelevant information from Wikipedia:\n${wikiResult.context}`;
      }

      // Prepare messages for DeepSeek (excluding initial greeting)
      const deepseekMessages = [
        { role: "system", content: systemPrompt },
        ...newMessages
          .filter((msg) => msg.sender !== "bot" || msg.id > 1)
          .map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
      ];

      const botResponse = await callDeepSeek(deepseekMessages);

      setMessages([
        ...newMessages,
        {
          id: newMessages.length + 1,
          text: botResponse,
          sender: "bot",
          sources: sources.length > 0 ? sources : ["https://en.wikipedia.org/wiki/History_of_Palestine"],
        },
      ]);
    } catch (error) {
      const errorMessage = getDeepSeekErrorMessage(
        error,
        "Sorry, I encountered an error. Please try again.",
      );
      setMessages([
        ...newMessages,
        {
          id: newMessages.length + 1,
          text: errorMessage,
          sender: "bot",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Expose controls for other components (homepage ask-bar, EventDetails)
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),

    // Open the widget and immediately submit a question
    askQuestion: (question) => {
      setIsOpen(true);
      submitQuestion(question);
    },

    askAboutEvent: async (event) => {
      setIsOpen(true);
      const userQuery = `Tell me about ${event.title}. It occurred on ${event.startDate} in ${event.location}. Category: ${event.category}. Tags: ${(event.tags || []).join(", ")}.`;

      const newMessages = [
        ...messages,
        { id: messages.length + 1, text: userQuery, sender: "user" },
      ];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const deepseekMessages = [
          {
            role: "system",
            content:
              "You are a knowledgeable guide about Palestinian history. Provide a concise, informative summary of the event based on the information provided. Then invite follow-up questions.",
          },
          { role: "user", content: userQuery },
        ];

        const botResponse = await callDeepSeek(deepseekMessages);
        setMessages([
          ...newMessages,
          {
            id: newMessages.length + 1,
            text: botResponse,
            sender: "bot",
            sources: [],
          },
        ]);
      } catch (error) {
        const errorMessage = getDeepSeekErrorMessage(
          error,
          "Sorry, I encountered an error summarizing this event. Please try asking about it directly.",
        );
        setMessages([
          ...newMessages,
          {
            id: newMessages.length + 1,
            text: errorMessage,
            sender: "bot",
            sources: [],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
  }));

  // Reset chat to initial state
  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleSend = () => {
    const text = input;
    setInput("");
    submitQuestion(text);
  };

  return (
    <>
      <style>{`
        .chatbot-messages::-webkit-scrollbar { width: 6px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: color-mix(in oklab, var(--muted-foreground) 30%, transparent);
          border-radius: 3px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
        }
      `}</style>

      {/* Chat Widget Container */}
      <div
        className={`fixed bottom-20 md:bottom-6 end-4 md:end-6 z-50 transition-all duration-300 ease-out ${
          isOpen
            ? "w-[min(24rem,calc(100vw-2rem))] h-[min(34rem,calc(100dvh-7rem))]"
            : "w-14 h-14 pointer-events-none"
        }`}
      >
        {/* Expanded Chat Window */}
        <div
          className={`flex flex-col h-full rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden transition-all duration-300 ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="relative border-b border-border/60 px-4 py-3.5 flex items-center justify-between bg-gradient-to-r from-primary/15 via-transparent to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-primary-foreground shadow-md shadow-primary/25">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">{t("chatbot.title")}</h3>
                <p className="text-[11px] text-muted-foreground">{t("chatbot.status")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                  title={t("chatbot.clear")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                title={t("chatbot.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
            {isEmptyChat && (
              <div className="flex-1 flex flex-col justify-center items-center gap-5 py-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <MessageCircleQuestion className="h-6 w-6 text-primary" />
                </span>
                <p className="text-sm text-muted-foreground text-center px-4">
                  {t("chatbot.startPrompt")}
                </p>
                <div className="w-full space-y-2">
                  {CONVERSATION_STARTERS.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitQuestion(starter)}
                      className="w-full p-3 rounded-xl border border-border/60 bg-background/40 text-sm text-foreground text-start transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            {!isEmptyChat &&
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "rounded-2xl rounded-bl-md border border-border/60 bg-muted/50 text-foreground"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p>{msg.text}</p>
                    ) : (
                      <div className="space-y-2">
                        <div>{renderMarkdown(msg.text)}</div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="border-t border-border/60 pt-2 mt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                              {msg.sources.length === 1 ? t("chatbot.source") : t("chatbot.sources")}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.startsWith("http") ? source : "https://en.wikipedia.org/wiki/History_of_Palestine"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{getSourceDisplayName(source)}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-border/60 bg-muted/50 px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/60 bg-background/40 p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder={t("chatbot.placeholder")}
              disabled={isLoading}
              className="flex-1 min-w-0 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title={t("chatbot.send")}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 rtl:-scale-x-100" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group fixed bottom-20 md:bottom-6 end-4 md:end-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40"
          title={t("chatbot.openChat")}
        >
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12 group-hover:scale-110" />
          <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-background" />
          </span>
        </button>
      )}
    </>
  );
});

export default ChatBot;
