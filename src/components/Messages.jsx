import { useState, useEffect, useRef } from "react";
import { Search, Plus, Mic, CheckCheck, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProfilePage from "./Profilepage";

const conversations = [
  { id: "hamza",  name: "Hamza",         initial: "H", color: "bg-orange-400", time: "11:35 am", preview: "😅",                        unread: true,  seedKey: "hamza"  },
  { id: "palrec", name: "PalRec Devs",   initial: null, color: "bg-red-500",   time: "9:50 am",  preview: "You: Good morning!!",       unread: false, seedKey: "palrec", isGroup: true },
  { id: "amr",    name: "Amr Bu-Gazala", initial: "A", color: "bg-blue-500",   time: "Yesterday", preview: "Thank you for sharing that photo.", unread: false, seedKey: "amr" },
  { id: "layla",  name: "Layla Haddad",  initial: "L", color: "bg-purple-500", time: "Tuesday",   preview: "I'll send the archive tomorrow.",   unread: false, seedKey: "layla" },
];

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();

function ConvoAvatar({ convo, size = "md" }) {
  const sz = size === "lg" ? "h-16 w-16 text-2xl" : "h-16 w-16 text-2xl";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${sz} ${convo.color}`}>
      {convo.isGroup ? <Users className="h-8 w-8" /> : convo.initial}
    </div>
  );
}

export default function Messages() {
  const [activeId, setActiveId] = useState("hamza");
  const [search, setSearch] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [userId, setUserId] = useState(null);
  // Profile panel: { seedKey } for sidebar contacts (all seed for now)
  const [profileView, setProfileView] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));

    const load = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      setAllMessages(data || []);
    };
    load();

    const channel = supabase
      .channel("messages-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setAllMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [allMessages, activeId]);

  const active = conversations.find((c) => c.id === activeId);
  const thread = allMessages.filter((m) => m.conversation_id === activeId);
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const insertMessage = async (payload) => {
    if (!userId) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: userId,
      ...payload,
    });
    if (error) console.error("Send failed:", error);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await insertMessage({ text: draft.trim() });
    setDraft("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const path = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("message-images").upload(path, file);
    if (error) return console.error(error);
    const { data } = supabase.storage.from("message-images").getPublicUrl(path);
    await insertMessage({ image_url: data.publicUrl });
  };

  const openProfile = (convo) => {
    setProfileView({ seedKey: convo.seedKey });
  };

  return (
    <div className="flex h-full text-[1.15rem] dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="flex w-96 flex-col border-r border-border bg-background/50 shrink-0">
        <div className="p-5">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-border bg-card/70 px-6 py-4 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-5 custom-scrollbar">
          {filtered.map((c) => {
            const conversationMessages = allMessages.filter((m) => m.conversation_id === c.id);
            const lastMessage = conversationMessages[conversationMessages.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => { setActiveId(c.id); setProfileView(null); }}
                className={`mb-4 flex w-full items-center gap-5 rounded-2xl p-4 text-left transition-colors ${
                  activeId === c.id && !profileView
                    ? "bg-[oklch(0.85_0.12_145/0.85)] dark:bg-emerald-600/30 dark:border dark:border-emerald-500/50"
                    : "hover:bg-[oklch(0.88_0.1_145/0.6)] dark:hover:bg-slate-800/40"
                }`}
              >
                <ConvoAvatar convo={c} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-bold text-foreground text-xl">{c.name}</span>
                    <span className="ml-2 shrink-0 text-sm text-muted-foreground">
                      {lastMessage ? formatTime(lastMessage.created_at) : c.time}
                    </span>
                  </div>
                  <p className="truncate text-base text-foreground/70">
                    {lastMessage
                      ? `${lastMessage.sender_id === userId ? "You: " : ""}${lastMessage.text || "📷 Image"}`
                      : c.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main area: profile panel OR chat ── */}
      <main className="relative flex flex-1 flex-col h-full overflow-hidden bg-transparent">

        {profileView ? (
          /* Profile panel slides in over the chat area */
          <ProfilePage
            seedKey={profileView.seedKey}
            onBack={() => setProfileView(null)}
          />
        ) : (
          <>
            {/* Chat header — name/avatar is clickable */}
            <div className="flex items-center gap-5 border-b border-border px-6 py-5 dark:bg-slate-900/20 shrink-0">
              <button
                className="flex items-center gap-5 group text-left"
                onClick={() => active && openProfile(active)}
              >
                <ConvoAvatar convo={active ?? { color: "bg-muted", initial: "?" }} />
                <div>
                  <div className="font-bold text-foreground text-2xl tracking-tight group-hover:text-primary group-hover:underline transition-colors">
                    {active?.name}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Click to view profile
                  </div>
                </div>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6 text-lg custom-scrollbar scroll-smooth">
              {thread.map((m) => {
                const isMe = m.sender_id === userId;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xl rounded-[1.5rem] px-3 py-3 text-foreground shadow-lg backdrop-blur-md ${
                      isMe
                        ? "bg-[oklch(0.85_0.12_145/0.85)] dark:bg-emerald-700/60 dark:text-emerald-50"
                        : "bg-[oklch(0.88_0.1_25/0.85)] dark:bg-slate-800/80 dark:text-slate-100 dark:border dark:border-white/5"
                    }`}>
                      {m.image_url && (
                        <img src={m.image_url} alt="upload" className="mb-2 max-h-96 w-full rounded-2xl object-cover shadow-inner" />
                      )}
                      {m.text && <p className="px-3 text-[1.15rem] leading-relaxed">{m.text}</p>}
                      <div className={`mt-2 px-3 flex items-center justify-end gap-1 text-[0.8rem] ${isMe ? "text-white/70" : "text-foreground/50"}`}>
                        {formatTime(m.created_at)}
                        <CheckCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <form onSubmit={sendMessage} className="shrink-0 flex items-center gap-4 border-t border-border px-6 py-5 dark:bg-slate-900/40 backdrop-blur-md">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 dark:bg-slate-800 text-foreground hover:bg-muted shadow-sm active:scale-95"
              >
                <Plus className="h-8 w-8" />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-card/70 dark:bg-slate-800/80 px-6 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button type="submit" className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 dark:bg-slate-800 text-foreground hover:bg-muted shadow-sm active:scale-95">
                <Mic className="h-8 w-8" />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
