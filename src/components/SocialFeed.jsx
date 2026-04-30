import { useEffect, useRef, useState } from "react";
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
  X,
  Loader2,
} from "lucide-react";
import { db, storage } from "../firebase";
import { ref as dbRef, onValue, push, set, serverTimestamp } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const seedPosts = [
  {
    id: "seed-1",
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
    createdAt: 0,
  },
  {
    id: "seed-2",
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
    createdAt: 0,
  },
];

function timeAgo(ts) {
  if (!ts) return "just now";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState({});
  const [draft, setDraft] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Filter state
  const [activeTab, setActiveTab] = useState("For you");

  useEffect(() => {
    const postsRef = dbRef(db, "posts");
    const unsub = onValue(postsRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setPosts(seedPosts);
        return;
      }
      const list = Object.entries(data).map(([id, value]) => ({ id, ...value }));
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setPosts([...list, ...seedPosts]);
    });
    return () => unsub();
  }, []);

  // Filter Logic:
  // "Following" -> Only shows your posts
  // "Trending" -> Only shows default seed posts
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "Following") return post.author === "You";
    if (activeTab === "Trending") return post.id.startsWith("seed-");
    return true; // "For you" shows everything
  });

  const toggleLike = (id) => {
    const isLiked = !!liked[id];
    setLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: (p.likes ?? 0) + (isLiked ? -1 : 1) } : p,
      ),
    );
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitPost = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text && !imageFile) return;
    setPosting(true);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `posts/${Date.now()}_${safeName}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, imageFile);
        imageUrl = await getDownloadURL(sRef);
      }

      const newRef = push(dbRef(db, "posts"));
      await set(newRef, {
        author: "You",
        role: "Community Member",
        initial: "Y",
        color: "bg-emerald-500",
        text,
        image: imageUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: Date.now(),
        timestamp: serverTimestamp(),
      });

      setDraft("");
      clearImage();
    } catch (err) {
      console.error("Failed to post:", err);
      setError(`Failed to post: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto dark:bg-slate-900/50 backdrop-blur transition-colors duration-300 custom-scrollbar">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground">
            Share stories, photos, and memories with the Palestine Recorded community.
          </p>
        </div>

        {/* Composer */}
        <form
          onSubmit={submitPost}
          className="rounded-xl border border-border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
        >
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                Y
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a story, photo, or memory..."
                className="min-h-[60px] flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {imagePreview && (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-border">
                <img src={imagePreview} alt="preview" className="max-h-80 w-full object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-2 rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary"
              >
                <ImageIcon className="h-4 w-4" /> Photo
              </button>
              <button type="button" className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <Video className="h-4 w-4" /> Video
              </button>
            </div>
            <button
              type="submit"
              disabled={(!draft.trim() && !imageFile) || posting}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {posting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {["For you", "Following", "Trending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
            >
              <div className="flex items-start justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${post.color ?? "bg-primary"}`}>
                    {post.initial ?? post.author?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground leading-tight">{post.author}</div>
                    <div className="text-xs italic text-muted-foreground">{post.role}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{post.time ?? timeAgo(post.createdAt)}</span>
                      <span>·</span>
                      <Globe className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {post.text && (
                <div className="px-4 pb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {post.text}
                </div>
              )}

              {post.image && (
                <div className="border-y border-border bg-muted">
                  <img src={post.image} alt="" className="w-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
                <span>{post.likes ?? 0} likes</span>
                <span>{post.comments ?? 0} comments · {post.shares ?? 0} shares</span>
              </div>

              <div className="flex items-center justify-around border-t border-border px-2 py-1">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 ${
                    liked[post.id] ? "text-red-500" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Heart className="h-4 w-4" fill={liked[post.id] ? "currentColor" : "none"} /> Like
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <MessageCircle className="h-4 w-4" /> Comment
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </article>
          ))}

          {filteredPosts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No posts to show in this section yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}