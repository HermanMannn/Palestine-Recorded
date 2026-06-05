import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon, Video, Heart, MessageCircle, Share2,
  MoreHorizontal, Globe, X, Loader2, ArrowLeft, Send, Plus,
  Home, BookOpen, Camera, Palette, MapPin, Users, UserCircle2,
  Flame, Bookmark, ChevronRight, Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProfilePage from "./Profilepage";

const GuestPrompt = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-lg p-6 max-w-sm shadow-2xl">
      <h3 className="font-bold text-lg mb-2">Sign up to interact</h3>
      <p className="text-sm text-muted-foreground mb-4">Create an account to comment, like, and share posts.</p>
      <button onClick={onClose} className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90">Got it</button>
    </div>
  </div>
);

const seedPosts = [
  {
    id: "seed-1", author: "Amr Bu-Gazala", role: "Former Palestinian Official",
    initial: "A", color: "bg-blue-500", time: "2h ago",
    text: "Sharing a photograph from my family archive — Jaffa, 1946. My grandfather's orange grove before everything changed. We must keep these memories alive for the next generation.",
    image_url: null, likes: 248, comments_count: 32, shares_count: 14, created_at: 0,
    seedKey: "amr", category: "Stories", location: "Jaffa, Palestine",
  },
  {
    id: "seed-2", author: "Rawda Asfur", role: "Palestinian Journalist",
    initial: "R", color: "bg-pink-500", time: "5h ago",
    text: "Today I visited the village my grandmother was born in. The almond trees she always spoke about are still there. Some roots cannot be erased. 🌿",
    image_url: null, likes: 512, comments_count: 78, shares_count: 41, created_at: 0,
    seedKey: "rawda", category: "Culture", location: "Galilee, Palestine",
  },
];

const seedComments = {
  "seed-1": [
    { id: "c1", author: "Layla Hassan", initial: "L", color: "bg-violet-500", time: "1h ago", text: "Thank you for sharing this. History must not be forgotten." },
    { id: "c2", author: "Omar Nasser", initial: "O", color: "bg-orange-500", time: "45m ago", text: "These orange groves were famous across the Arab world. Beautiful archive." },
  ],
  "seed-2": [
    { id: "c3", author: "Sara Al-Khalidi", initial: "S", color: "bg-teal-500", time: "3h ago", text: "The almond trees always survive. A powerful symbol." },
  ],
};

const NAV_ITEMS = [
  { key: "Community Feed", icon: Home },
  { key: "Stories", icon: BookOpen },
  { key: "Photos", icon: Camera },
  { key: "Culture", icon: Palette },
  { key: "Places", icon: MapPin },
  { key: "Groups", icon: Users },
  { key: "Members", icon: UserCircle2 },
];

const FILTER_CHIPS = ["All Posts", "Stories", "Photos", "Culture", "Places", "Events"];

const TRENDING = [
  { tag: "Jerusalem", posts: "1.2K posts" },
  { tag: "Family Stories", posts: "980 posts" },
  { tag: "Old Photos", posts: "756 posts" },
  { tag: "Recipes", posts: "642 posts" },
  { tag: "Culture", posts: "591 posts" },
];

const COMMUNITIES = [
  { name: "Jerusalem Stories", members: "1.8K members", color: "bg-amber-500" },
  { name: "Palestinian Cuisine", members: "1.4K members", color: "bg-orange-500" },
  { name: "Old Photos Archive", members: "1.2K members", color: "bg-stone-500" },
  { name: "Heritage & Tradition", members: "2.2K members", color: "bg-emerald-600" },
];

const EVENTS = [
  { month: "MAY", day: "24", title: "Olive Harvest Festival", time: "May 24 · 3:00 PM", place: "Ramallah, Palestine" },
  { month: "MAY", day: "27", title: "Embroidery Workshop", time: "May 27 · 11:00 AM", place: "Nablus Cultural Center" },
  { month: "JUN", day: "05", title: "Palestine Through Our Lens", time: "Jun 5 · 6:00 PM", place: "Online Event" },
];

function timeAgo(ts) {
  if (!ts) return "just now";
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ post, size = "md" }) {
  const sz = size === "lg" ? "h-12 w-12 text-base" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${sz} ${post.color ?? "bg-primary"}`}>
      {post.avatar_url
        ? <img src={post.avatar_url} alt="" className="h-full w-full object-cover" />
        : (post.initial ?? post.author?.[0])}
    </div>
  );
}

function PostCard({ post, onClick, onAuthorClick, liked, onToggleLike, isSelected }) {
  return (
    <article
      onClick={() => onClick(post)}
      className={`rounded-2xl border bg-card shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
        isSelected ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between p-4 pb-3">
        <div
          className="flex items-center gap-3 group"
          onClick={(e) => { e.stopPropagation(); onAuthorClick(post); }}
        >
          <Avatar post={post} />
          <div>
            <div className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer">
              {post.author}
            </div>
            <div className="text-xs text-muted-foreground">
              {post.location ? `${post.location} · ` : ""}{post.time ?? timeAgo(post.created_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.category && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {post.category}
            </span>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {post.text && (
        <div className="px-4 pb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap line-clamp-4">{post.text}</div>
      )}

      {post.location && (
        <div className="px-4 pb-3 flex items-center gap-1 text-xs text-primary">
          <MapPin className="h-3 w-3" />
          <span>{post.location}</span>
        </div>
      )}

      {post.image_url && (
        <div className="border-y border-border bg-muted">
          <img src={post.image_url} alt="" className="w-full object-cover max-h-96" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLike(post.id); }}
            disabled={post.isGuest}
            className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              liked ? "text-red-500" : "hover:text-primary"
            }`}
          >
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
            <span className="text-xs">{post.likes ?? 0}</span>
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments_count ?? 0}</span>
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </button>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <Bookmark className="h-4 w-4" />
          <span className="text-xs">Save</span>
        </button>
      </div>
    </article>
  );
}

function PostDetail({ post, liked, onToggleLike, onClose, onAuthorClick, user, profiles, currentUserAvatarUrl }) {
  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState(seedComments[post.id] || []);
  const [submitting, setSubmitting] = useState(false);

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentDraft.trim();
    if (!user || !text) return;
    setSubmitting(true);
    const prof = profiles[user.id];
    const newComment = {
      id: `local-${Date.now()}`,
      author: prof?.username || "You",
      initial: (prof?.username || "Y")[0].toUpperCase(),
      color: "bg-emerald-500",
      avatar_url: currentUserAvatarUrl || null,
      time: "just now",
      text,
    };
    setComments((prev) => [...prev, newComment]);
    setCommentDraft("");
    setSubmitting(false);
  };

  const currentUserPost = {
    avatar_url: currentUserAvatarUrl,
    initial: (profiles[user?.id]?.username || "Y")[0].toUpperCase(),
    color: "bg-primary",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-foreground">Post</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between p-4 pb-3">
          <button className="flex items-center gap-3 group text-left" onClick={() => onAuthorClick(post)}>
            <Avatar post={post} size="lg" />
            <div>
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{post.author}</div>
              <div className="text-xs italic text-muted-foreground">{post.role}</div>
            </div>
          </button>
        </div>

        {post.text && (
          <div className="px-4 pb-4 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">{post.text}</div>
        )}

        {post.image_url && (
          <div className="border-y border-border bg-muted mb-3">
            <img src={post.image_url} alt="" className="w-full object-cover" />
          </div>
        )}

        <div className="px-4 pb-3 flex items-center gap-1.5 text-xs text-muted-foreground border-b border-border">
          <Globe className="h-3 w-3" />
          <span>{post.time ?? timeAgo(post.created_at)}</span>
        </div>

        <div className="flex items-center justify-around border-b border-border px-2 py-1">
          <button onClick={() => onToggleLike(post.id)} className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 ${liked ? "text-red-500" : "text-muted-foreground hover:text-primary"}`}>
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> Like
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
            <MessageCircle className="h-4 w-4" /> Comment
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        <div className="divide-y divide-border">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 px-4 py-3">
              <Avatar post={c} size="sm" />
              <div className="flex-1">
                <div className="rounded-xl bg-muted/60 px-3 py-2">
                  <div className="text-xs font-semibold text-foreground mb-0.5">{c.author}</div>
                  <div className="text-sm text-foreground leading-snug">{c.text}</div>
                </div>
                <div className="mt-1 flex items-center gap-3 px-1 text-xs text-muted-foreground">
                  <span>{c.time}</span>
                  <button className="font-medium hover:text-primary">Like</button>
                  <button className="font-medium hover:text-primary">Reply</button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No comments yet. Be the first!</div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3 bg-card">
        <form onSubmit={submitComment} className="flex items-end gap-2">
          <Avatar post={currentUserPost} size="sm" />
          <div className="flex-1 flex items-end gap-2 rounded-xl border border-input bg-muted/40 px-3 py-2">
            <textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(e); } }}
              placeholder={user ? "Write a comment…" : "Log in to comment"}
              disabled={!user}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none disabled:opacity-60 leading-snug"
              style={{ minHeight: "20px", maxHeight: "80px" }}
            />
            <button type="submit" disabled={!commentDraft.trim() || submitting || !user} className="shrink-0 text-primary hover:text-primary/70 disabled:opacity-40">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComposerModal({ open, onClose, user, profiles, currentUserAvatarUrl, onSubmit, draft, setDraft, imageFile, imagePreview, fileInputRef, handlePickImage, clearImage, posting, error }) {
  if (!open) return null;
  const currentUserAvatarPost = {
    avatar_url: currentUserAvatarUrl,
    initial: (profiles[user?.id]?.username || "Y")[0].toUpperCase(),
    color: "bg-primary",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-lg">Share a Story</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/40"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-3">
            <Avatar post={currentUserAvatarPost} />
            <div className="flex-1 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => { if (e.target.value.length <= 500) setDraft(e.target.value); }}
                maxLength={500}
                placeholder={user ? "Share a story, photo, or memory..." : "Log in to share..."}
                disabled={!user}
                className="min-h-[120px] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
              />
              <div className="text-xs text-muted-foreground text-right">{draft.length}/500</div>
            </div>
          </div>
          {imagePreview && (
            <div className="relative mt-3 overflow-hidden rounded-lg border border-border">
              <img src={imagePreview} alt="preview" className="max-h-80 w-full object-cover" />
              <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"><X className="h-4 w-4" /></button>
            </div>
          )}
          {error && <div className="mt-2 rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-700 dark:text-red-400">{error}</div>}
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <div className="flex items-center gap-1">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
              <ImageIcon className="h-4 w-4" /> Photo
            </button>
            <button type="button" className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
              <Video className="h-4 w-4" /> Video
            </button>
          </div>
          <button type="submit" disabled={(!draft.trim() && !imageFile) || posting || !user} className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {posting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SocialFeed() {
  const [dbPosts, setDbPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [liked, setLiked] = useState({});
  const [draft, setDraft] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [currentUserAvatarUrl, setCurrentUserAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All Posts");
  const [activeNav, setActiveNav] = useState("Community Feed");
  const [selectedPost, setSelectedPost] = useState(null);
  const [profileView, setProfileView] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const requireAuth = (cb) => { if (!user) { setShowGuestPrompt(true); return; } cb(); };

  useEffect(() => {
    let profileChannel;
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id;
      setUser(authData.user || null);

      if (uid) {
        const { data: prof } = await supabase.from("profiles").select("avatar_url, username").eq("id", uid).maybeSingle();
        setCurrentUserAvatarUrl(prof?.avatar_url || null);
        setProfiles((prev) => ({ ...prev, [uid]: { id: uid, ...prof } }));

        profileChannel = supabase
          .channel("profile-social")
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
            (payload) => setCurrentUserAvatarUrl(payload.new.avatar_url || null))
          .subscribe();
      }

      const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      setDbPosts(posts || []);
      const ids = [...new Set((posts || []).map((p) => p.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, username, avatar_url").in("id", ids);
        const map = {};
        (profs || []).forEach((p) => { map[p.id] = p; });
        setProfiles((prev) => ({ ...prev, ...map }));
      }
    };
    init();

    const postsChannel = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setDbPosts((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, []);

  const allPosts = [
    ...dbPosts.map((p) => {
      const prof = profiles[p.user_id];
      return {
        ...p,
        author: prof?.username || "Member",
        role: "Community Member",
        initial: (prof?.username || "M")[0].toUpperCase(),
        color: "bg-emerald-500",
        avatar_url: prof?.avatar_url,
        category: "Stories",
      };
    }),
    ...seedPosts,
  ];

  const filteredPosts = allPosts.filter((p) => {
    if (activeFilter === "All Posts") return true;
    return p.category === activeFilter;
  });

  useEffect(() => {
    if (!selectedPost) return;
    const updated = allPosts.find((p) => p.id === selectedPost.id);
    if (updated) setSelectedPost(updated);
  }, [dbPosts]);

  const toggleLike = async (id) => {
    const isLiked = !!liked[id];
    setLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setDbPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: (p.likes ?? 0) + (isLiked ? -1 : 1) } : p));
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => prev ? { ...prev, likes: (prev.likes ?? 0) + (isLiked ? -1 : 1) } : prev);
    }
    if (!String(id).startsWith("seed-")) {
      const post = dbPosts.find((p) => p.id === id);
      if (post) {
        await supabase.from("posts").update({ likes: (post.likes ?? 0) + (isLiked ? -1 : 1) }).eq("id", id);
      }
    }
  };

  const openAuthorProfile = (post) => {
    setSelectedPost(null);
    if (post.user_id) setProfileView({ userId: post.user_id });
    else if (post.seedKey) setProfileView({ seedKey: post.seedKey });
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please pick an image file.");
    if (file.size > 8 * 1024 * 1024) return setError("Image must be under 8MB.");
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
    if (!user) return setError("Please log in to post.");
    const text = draft.trim();
    if (!text && !imageFile) return;
    setPosting(true);
    setError("");
    try {
      let image_url = null;
      if (imageFile) {
        const safe = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage.from("post-images").upload(path, imageFile);
        if (upErr) throw upErr;
        image_url = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("posts").insert({ user_id: user.id, text, image_url });
      if (error) throw error;
      setDraft("");
      clearImage();
      setComposerOpen(false);
    } catch (err) {
      setError(`Failed to post: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  const panelOpen = !!selectedPost || !!profileView;
  const userProfile = profiles[user?.id];
  const userName = userProfile?.username || (user?.email?.split("@")[0]) || "Guest";

  return (
    <div className="absolute inset-0 flex overflow-hidden">

      {/* ── Detail / profile drawer ── */}
      <div
        className={`flex-shrink-0 border-r border-border bg-card transition-all duration-300 ease-in-out overflow-hidden
          ${panelOpen ? "w-full sm:w-[380px] lg:w-[420px]" : "w-0"}`}
        style={{ willChange: "width" }}
      >
        {profileView && (
          <ProfilePage userId={profileView.userId} seedKey={profileView.seedKey} onBack={() => setProfileView(null)} />
        )}
        {selectedPost && !profileView && (
          <PostDetail
            post={selectedPost}
            liked={!!liked[selectedPost.id]}
            onToggleLike={toggleLike}
            onClose={() => setSelectedPost(null)}
            onAuthorClick={openAuthorProfile}
            user={user}
            profiles={profiles}
            currentUserAvatarUrl={currentUserAvatarUrl}
          />
        )}
      </div>

      {/* ── Main 3-column layout ── */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${panelOpen ? "hidden sm:block" : "block"}`}>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-6">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="hidden lg:flex flex-col gap-4">
              {/* Profile card */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar post={{ avatar_url: currentUserAvatarUrl, initial: userName[0]?.toUpperCase(), color: "bg-emerald-600" }} size="lg" />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{userName}</div>
                    <div className="text-xs text-muted-foreground">Community Member</div>
                  </div>
                </div>
                <button
                  onClick={() => user ? setProfileView({ userId: user.id }) : setShowGuestPrompt(true)}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View profile <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="rounded-2xl border border-border bg-card p-2 shadow-sm">
                {NAV_ITEMS.map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveNav(key)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      activeNav === key
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-accent/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {key}
                  </button>
                ))}
              </nav>

              {/* Trending */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <h3 className="font-semibold text-foreground text-sm">Trending Topics</h3>
                </div>
                <ul className="space-y-2.5">
                  {TRENDING.map((t) => (
                    <li key={t.tag} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/80"># {t.tag}</span>
                      <span className="text-xs text-muted-foreground">{t.posts}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 text-xs font-medium text-primary hover:underline">See all</button>
              </div>

              {/* Quote */}
              <div className="rounded-2xl border border-border bg-rose-50 dark:bg-rose-950/20 p-4 shadow-sm relative overflow-hidden">
                <Quote className="h-5 w-5 text-rose-400 mb-2" />
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  "Our stories are the roots that keep us connected."
                </p>
                <p className="mt-2 text-xs text-muted-foreground">— Palestinian Proverb</p>
              </div>
            </aside>

            {/* ── CENTER FEED ── */}
            <main className="min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Community</h1>
                  <p className="text-sm text-muted-foreground mt-1">Share, preserve, and celebrate our stories and culture.</p>
                </div>
                <button
                  onClick={() => requireAuth(() => setComposerOpen(true))}
                  className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Share a Story
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-4 mb-4 -mx-1 px-1">
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeFilter === chip
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/60 text-muted-foreground hover:bg-accent/40"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Feed */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{ ...post, isGuest: !user }}
                    onClick={setSelectedPost}
                    onAuthorClick={openAuthorProfile}
                    liked={!!liked[post.id]}
                    onToggleLike={() => requireAuth(() => toggleLike(post.id))}
                    isSelected={selectedPost?.id === post.id}
                  />
                ))}
                {filteredPosts.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">No posts to show in this section yet.</div>
                )}
              </div>
            </main>

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="hidden lg:flex flex-col gap-4">
              {/* Active Communities */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm">Active Communities</h3>
                  <button className="text-xs font-medium text-primary hover:underline">See all</button>
                </div>
                <ul className="space-y-3">
                  {COMMUNITIES.map((c) => (
                    <li key={c.name} className="flex items-center gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-full ${c.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.members}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Daily Inspiration */}
              <div className="rounded-2xl border border-border bg-emerald-50 dark:bg-emerald-950/20 p-4 shadow-sm">
                <h3 className="font-semibold text-foreground text-sm mb-3">Daily Inspiration</h3>
                <p className="text-sm font-medium text-foreground leading-relaxed italic">
                  "We have on this earth what makes life worth living."
                </p>
                <p className="mt-3 text-xs text-muted-foreground">— Mahmoud Darwish</p>
              </div>

              {/* Upcoming Events */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm">Upcoming Events</h3>
                  <button className="text-xs font-medium text-primary hover:underline">See all</button>
                </div>
                <ul className="space-y-4">
                  {EVENTS.map((ev) => (
                    <li key={ev.title} className="flex items-start gap-3">
                      <div className="shrink-0 w-11 rounded-lg border border-border bg-muted/40 text-center overflow-hidden">
                        <div className="bg-primary/10 text-primary text-[10px] font-bold py-0.5">{ev.month}</div>
                        <div className="text-base font-bold text-foreground py-0.5">{ev.day}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground leading-tight">{ev.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{ev.time}</div>
                        <div className="text-xs text-muted-foreground">{ev.place}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

          </div>
        </div>
      </div>

      <ComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        user={user}
        profiles={profiles}
        currentUserAvatarUrl={currentUserAvatarUrl}
        onSubmit={submitPost}
        draft={draft}
        setDraft={setDraft}
        imageFile={imageFile}
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        handlePickImage={handlePickImage}
        clearImage={clearImage}
        posting={posting}
        error={error}
      />

      {showGuestPrompt && <GuestPrompt onClose={() => setShowGuestPrompt(false)} />}
    </div>
  );
}
