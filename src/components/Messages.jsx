import { useState } from "react";
import { Search, Plus, Mic, CheckCheck, Users } from "lucide-react";

const conversations = [
  {
    id: "hamza",
    name: "Hamza",
    initial: "H",
    color: "bg-orange-400",
    time: "11:35 am",
    preview: "😅",
    unread: true,
  },
  {
    id: "palrec",
    name: "PalRec Devs",
    initial: <Users className="h-6 w-6" />,
    color: "bg-red-500",
    time: "9:50 am",
    preview: "You: Good morning!!",
    unread: false,
  },
  {
    id: "amr",
    name: "Amr Bu-Gazala",
    initial: "A",
    color: "bg-blue-500",
    time: "Yesterday",
    preview: "Thank you for sharing that photo.",
    unread: false,
  },
  {
    id: "layla",
    name: "Layla Haddad",
    initial: "L",
    color: "bg-purple-500",
    time: "Tuesday",
    preview: "I'll send the archive tomorrow.",
    unread: false,
  },
];

const initialMessages = {
  hamza: [
    {
      id: 1,
      from: "me",
      text: "How is your project coming along? Preserving Palestinian culture is very very important!!",
      time: "11:34 am",
    },
    { id: 2, from: "them", text: "Well... not as smoothly as you'd like", time: "11:35 am" },
    { id: 3, from: "them", text: "😅", time: "11:35 am", emoji: true },
  ],
  palrec: [
    { id: 1, from: "me", text: "Good morning!!", time: "9:50 am" },
  ],
  amr: [
    { id: 1, from: "them", text: "Thank you for sharing that photo.", time: "Yesterday" },
  ],
  layla: [
    { id: 1, from: "them", text: "I'll send the archive tomorrow.", time: "Tuesday" },
  ],
};

export default function Messages() {
  const [activeId, setActiveId] = useState("hamza");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId);
  const thread = messages[activeId] ?? [];

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        { id: Date.now(), from: "me", text: draft, time: "now" },
      ],
    }));
    setDraft("");
  };

  return (
    <div className="flex h-full">
      {/* Conversations sidebar */}
      <aside className="flex w-72 flex-col border-r border-border bg-[oklch(0.92_0.08_140)]">
        <div className="p-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-border bg-card px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`mb-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                activeId === c.id
                  ? "bg-[oklch(0.85_0.12_145)]"
                  : "hover:bg-[oklch(0.88_0.1_145)]"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${c.color}`}
              >
                {typeof c.initial === "string" ? c.initial : c.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate font-bold text-foreground">
                    {c.name}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {c.time}
                  </span>
                </div>
                <p className="truncate text-sm text-foreground/80">
                  {c.preview}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <main className="relative flex flex-1 flex-col bg-[oklch(0.94_0.04_145)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-border bg-[oklch(0.88_0.08_25/0.6)] px-4 py-3 backdrop-blur-sm">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${active?.color ?? "bg-muted"}`}
          >
            {active?.initial}
          </div>
          <div>
            <div className="font-bold text-foreground">{active?.name}</div>
            <div className="text-xs text-muted-foreground">
              click here to view profile
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {thread.map((m) =>
            m.from === "me" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-md rounded-2xl bg-[oklch(0.85_0.12_145)] px-4 py-2 text-foreground shadow">
                  <p className="text-sm">{m.text}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-foreground/60">
                    {m.time}
                    <CheckCheck className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                {m.emoji ? (
                  <div className="rounded-xl bg-[oklch(0.85_0.1_25)] p-3 shadow">
                    <div className="text-5xl">😅</div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-foreground/60">
                      {m.time}
                      <CheckCheck className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md rounded-2xl bg-[oklch(0.88_0.1_25)] px-4 py-2 text-foreground shadow">
                    <p className="text-sm">{m.text}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-foreground/60">
                      {m.time}
                      <CheckCheck className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 border-t border-border bg-[oklch(0.35_0.05_145)] px-4 py-3"
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground hover:bg-muted"
          >
            <Plus className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground hover:bg-muted"
          >
            <Mic className="h-5 w-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
