import { useState } from "react";
import {
  Image as ImageIcon,
  Video,
  MapPin,
  Smile,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
} from "lucide-react";

const initialPosts = [
  {
    id: 1,
    author: "Amr Bu-Gazala",
    role: "Former Palestinian Official",
    initial: "A",
    color: "bg-blue-500",
    time: "2h ago",
    text: "Sharing a photograph from my family archive — Jaffa, 1946. My grandfather's orange grove before everything changed. We must keep these memories alive for the next generation.",
    image: null,
    likes: 248,
    comments: 32,
    shares: 14,
  },
  {
    id: 2,
    author: "Rawda Asfur",
    role: "Palestinian Journalist",
    initial: "R",
    color: "bg-pink-500",
    time: "5h ago",
    text: "Today I visited the village my grandmother was born in. The almond trees she always spoke about are still there. Some roots cannot be erased. 🌿",
    image: null,
    likes: 512,
    comments: 78,
    shares: 41,
  },
  {
    id: 3,
    author: "Yusuf Al-Khalidi",
    role: "Historian",
    initial: "Y",
    color: "bg-amber-500",
    time: "1d ago",
    text: "New oral history project launching next week — we're collecting voice recordings from elders across the diaspora. If you or a family member has a story to share, please reach out.",
    image: null,
    likes: 189,
    comments: 24,
    shares: 56,
  },
];

export default function SocialFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [liked, setLiked] = useState({});
  const [draft, setDraft] = useState("");

  const toggleLike = (id) => {
    const isLiked = !!liked[id];
    setLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p
      )
    );
  };

  return (
    <div className="absolute inset-0 right-14 overflow-y-auto bg-gradient-to-b from-secondary/5 to-background">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground">
            Share stories, photos, and memories with the Palestine Recorded community.
          </p>
        </div>

        {/* Composer */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                M
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a story, photo, or memory..."
                className="min-h-[60px] flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <ImageIcon className="h-4 w-4" /> Photo
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <Video className="h-4 w-4" /> Video
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <MapPin className="h-4 w-4" /> Location
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <Smile className="h-4 w-4" /> Feeling
              </button>
            </div>
            <button
              disabled={!draft.trim()}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          <button className="border-b-2 border-primary px-4 py-2 text-sm font-medium text-primary">
            For you
          </button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Following
          </button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Trending
          </button>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-start justify-between p-4 pb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${post.color}`}
                >
                  {post.initial}
                </div>
                <div>
                  <div className="font-semibold text-foreground leading-tight">
                    {post.author}
                  </div>
                  <div className="text-xs italic text-muted-foreground">
                    {post.role}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{post.time}</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>
              </div>
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 pb-3 text-sm leading-relaxed text-foreground">
              {post.text}
            </div>

            {post.image && (
              <div className="border-y border-border bg-muted">
                <img src={post.image} alt="" className="w-full object-cover" />
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
              <span>{post.likes} likes</span>
              <span>
                {post.comments} comments · {post.shares} shares
              </span>
            </div>

            <div className="flex items-center justify-around border-t border-border px-2 py-1">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 ${
                  liked[post.id]
                    ? "text-red-500 hover:text-red-500"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={liked[post.id] ? "currentColor" : "none"}
                />{" "}
                Like
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <MessageCircle className="h-4 w-4" /> Comment
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <Bookmark className="h-4 w-4" /> Save
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
