import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { callDeepSeek, MISSING_DEEPSEEK_API_KEY_ERROR } from "../services/deepseekService";
import { searchWikipedia } from "../services/wikipediaService";
import { renderMarkdown } from "../utils/markdownParser.jsx";
import { timelineData } from "./TimelineSidebar.jsx";

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

// ===== UI COMPONENTS =====

// SVG icon for lightbulb/AI
const LightbulbIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 4.64l-.707.707M9 19.071A9.003 9.003 0 0112 20.07m0 0A9.003 9.003 0 0115 19.07"
    />
  </svg>
);

// SVG icon for external link
const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

// SVG icon for trash/delete
const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// SVG icon for close (X)
const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// SVG icon for loading spinner
const SpinnerIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// SVG icon for send button
const SendIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// ===== MAIN COMPONENT =====

const ChatBot = forwardRef(function ChatBot(props, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isEmptyChat = messages.length === 1;

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expose method for EventDetails to ask about events
  useImperativeHandle(ref, () => ({
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
  };

  // Pre-fill input with conversation starter
  const handlePresetClick = (preset) => {
    setInput(preset);
  };

  // Main message handling: validate, search, and get AI response
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");

    const newMessages = [
      ...messages,
      { id: messages.length + 1, text: userMessage, sender: "user" },
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

  return (
    <>
      <style>{`
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>

      {/* Chat Widget Container */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isOpen ? "w-96 h-[500px]" : "w-16 h-16"
        }`}
      >
        {/* Expanded Chat Window */}
        <div
          className={`flex flex-col h-full bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 border-b border-border/50 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-base">Palestine Guide</h3>
              <p className="text-xs text-foreground/50 mt-0.5">Powered by AI</p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className="text-foreground/60 hover:text-foreground/90 transition-colors p-1 hover:bg-white/10 rounded-lg"
                  title="Clear chat"
                >
                  <TrashIcon />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/60 hover:text-foreground/90 transition-colors p-1 hover:bg-white/10 rounded-lg"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
            {isEmptyChat && (
              <div className="flex-1 flex flex-col justify-center items-center gap-4 py-8">
                <p className="text-sm text-foreground/60 text-center">Start a conversation below</p>
                <div className="w-full space-y-2.5">
                  {CONVERSATION_STARTERS.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(starter)}
                      className="w-full p-3 rounded-lg bg-zinc-700/30 hover:bg-zinc-700/50 border border-zinc-600/40 text-sm text-foreground/90 transition-all text-left hover:text-white active:scale-95"
                    >
                      💬 {starter}
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
                    className={`max-w-sm px-4 py-3 rounded-xl ${
                      msg.sender === "user"
                        ? "bg-emerald-600/40 text-white rounded-br-none border border-emerald-500/40"
                        : "bg-zinc-700/40 text-foreground/90 rounded-bl-none border border-zinc-600/40"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm leading-relaxed">
                          {renderMarkdown(msg.text)}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="border-t border-zinc-600/30 pt-2 mt-2">
                            <p className="text-xs text-foreground/60 font-medium mb-2">
                              {msg.sources.length === 1 ? "Source" : "Sources"} ({msg.sources.length})
                            </p>
                            <div className="space-y-1.5">
                              {msg.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.startsWith("http") ? source : "https://en.wikipedia.org/wiki/History_of_Palestine"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-xs text-emerald-400 hover:text-emerald-300 transition-all w-full"
                                >
                                  <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0" />
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

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-700/40 text-foreground/90 rounded-xl rounded-bl-none border border-zinc-600/40 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-zinc-900/20 p-3.5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder="Ask about Palestine..."
              disabled={isLoading}
              className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600/70 hover:bg-emerald-600/90 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white px-3.5 py-2.5 rounded-lg transition-all font-medium text-sm active:scale-95"
            >
              {isLoading ? <SpinnerIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Open chat"
        >
          <LightbulbIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </>
  );
});

export default ChatBot;
