import { useState, useEffect, useRef } from "react";
import { Search, Plus, Mic, CheckCheck, Users } from "lucide-react";
import { db } from '../firebase'; 
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";

const conversations = [
  { id: "hamza", name: "Hamza", initial: "H", color: "bg-orange-400", time: "11:35 am", preview: "😅", unread: true },
  { id: "palrec", name: "PalRec Devs", initial: <Users className="h-8 w-8" />, color: "bg-red-500", time: "9:50 am", preview: "You: Good morning!!", unread: false },
  { id: "amr", name: "Amr Bu-Gazala", initial: "A", color: "bg-blue-500", time: "Yesterday", preview: "Thank you for sharing that photo.", unread: false },
  { id: "layla", name: "Layla Haddad", initial: "L", color: "bg-purple-500", time: "Tuesday", preview: "I'll send the archive tomorrow.", unread: false },
];

export default function Messages() {
  const [activeId, setActiveId] = useState("hamza");
  const [search, setSearch] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [draft, setDraft] = useState("");
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Real-time Firebase Sync
  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAllMessages(messageList);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, activeId]);

  const active = conversations.find((c) => c.id === activeId);
  const thread = allMessages.filter((m) => m.conversationId === activeId);
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // 3. Handlers
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;

    await pushToFirebase({ text: draft.trim() });
    setDraft("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      pushToFirebase({ image: localUrl });
    }
  };

  const pushToFirebase = async (payload) => {
    try {
      const messagesRef = ref(db, 'messages');
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        conversationId: activeId,
        from: "me",
        ...payload,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase(),
        timestamp: serverTimestamp() 
      });
    } catch (err) {
      console.error("Message error:", err);
    }
  };

  return (
    <div className="flex h-full text-[1.15rem] dark:bg-slate-900/40 dark:backdrop-blur-xl transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar */}
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
            const conversationMessages = allMessages.filter(m => m.conversationId === c.id);
            const lastMessage = conversationMessages[conversationMessages.length - 1];

            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`mb-4 flex w-full items-center gap-5 rounded-2xl p-4 text-left transition-colors ${
                  activeId === c.id
                    ? "bg-[oklch(0.85_0.12_145/0.85)] dark:bg-emerald-600/30 dark:border dark:border-emerald-500/50"
                    : "hover:bg-[oklch(0.88_0.1_145/0.6)] dark:hover:bg-slate-800/40"
                }`}
              >
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-sm ${c.color}`}>
                  {c.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-bold text-foreground text-xl">{c.name}</span>
                    <span className="ml-2 shrink-0 text-sm text-muted-foreground">
                      {lastMessage ? lastMessage.time : c.time}
                    </span>
                  </div>
                  <p className="truncate text-base text-foreground/70">
                    {lastMessage 
                      ? `${lastMessage.from === 'me' ? 'You: ' : ''}${lastMessage.text || '📷 Image'}` 
                      : c.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Chat */}
      <main className="relative flex flex-1 flex-col h-full overflow-hidden bg-transparent">
        <div className="flex items-center gap-5 border-b border-border px-6 py-5 dark:bg-slate-900/20 shrink-0">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md ${active?.color ?? "bg-muted"}`}>
            {active?.initial}
          </div>
          <div>
            <div className="font-bold text-foreground text-2xl tracking-tight">{active?.name}</div>
            <div className="text-sm text-muted-foreground font-medium">Click to view profile</div>
          </div>
        </div>

        {/* Message Thread */}
        <div 
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6 text-lg custom-scrollbar scroll-smooth"
        >
          {thread.map((m) => {
            const isMe = m.from === "me";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xl rounded-[1.5rem] px-3 py-3 text-foreground shadow-lg backdrop-blur-md transition-colors ${
                  isMe 
                    ? "bg-[oklch(0.85_0.12_145/0.85)] dark:bg-emerald-700/60 dark:text-emerald-50" 
                    : "bg-[oklch(0.88_0.1_25/0.85)] dark:bg-slate-800/80 dark:text-slate-100 dark:border dark:border-white/5"
                }`}>
                  {m.image && (
                    <img src={m.image} alt="Local Upload" className="mb-2 max-h-96 w-full rounded-2xl object-cover shadow-inner" />
                  )}
                  {m.text && <p className="px-3 text-[1.15rem] leading-relaxed">{m.text}</p>}
                  <div className={`mt-2 px-3 flex items-center justify-end gap-1 text-[0.8rem] ${isMe ? "text-white/70" : "text-foreground/50"}`}>
                    {m.time}
                    <CheckCheck className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <form onSubmit={sendMessage} className="shrink-0 flex items-center gap-4 border-t border-border px-6 py-5 dark:bg-slate-900/40 backdrop-blur-md">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 dark:bg-slate-800 text-foreground hover:bg-muted shadow-sm transition-transform active:scale-95"
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
          
          <button type="submit" className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 dark:bg-slate-800 text-foreground hover:bg-muted shadow-sm transition-transform active:scale-95">
            <Mic className="h-8 w-8" />
          </button>
        </form>
      </main>
    </div>
  );
}