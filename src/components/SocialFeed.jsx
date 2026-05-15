import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon, Video, Heart, MessageCircle, Share2,
  MoreHorizontal, Globe, X, Loader2, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const seedPosts = [
  {
    id: "seed-1", author: "Amr Bu-Gazala", role: "Former Palestinian Official",
    initial: "A", color: "bg-blue-500", time: "2h ago",
    text: "Sharing a photograph from my family archive — Jaffa, 1946. My grandfather's orange grove before everything changed. We must keep these memories alive for the next generation.",
    image_url: null, likes: 248, comments_count: 32, shares_count: 14, created_at: 0,
  },
  {
    id: "seed-2", author: "Rawda Asfur", role: "Palestinian Journalist",
    initial: "R", color: "bg-pink-500", time: "5h ago",
    text: "Today I visited the village my grandmother was born in. The almond trees she always spoke about are still there. Some roots cannot be erased. 🌿",
    image_url: null, likes: 512, comments_count: 78, shares_count: 41, created_at: 0,
  },
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

export default function SocialFeed() {
  const [dbPosts, setDbPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set()); // post ids liked by current user
  const [likeCounts, setLikeCounts] = useState({});        // post id -> count
  const [commentCounts, setCommentCounts] = useState({});  // post id -> count
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [comments, setComments] = useState({});            // post id -> comment[]
  const [commentDraft, setCommentDraft] = useState({});    // post id -> string
  const [submittingComment, setSubmittingComment] = useState({});
  const [draft, setDraft] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("For you");

  // ── initial load ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    loadPosts();

    const channel = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setDbPosts((prev) => [payload.new, ...prev]);
        setLikeCounts((prev) => ({ ...prev, [payload.new.id]: 0 }));
        setCommentCounts((prev) => ({ ...prev, [payload.new.id]: 0 }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadPosts = async () => {
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!posts?.length) return;
    setDbPosts(posts);

    const postIds = posts.map((p) => p.id);

    // profiles
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: profs } = await supabase
      .from("profiles").select("id, username, avatar_url").in("id", userIds);
    const profMap = {};
    (profs || []).forEach((p) => { profMap[p.id] = p; });
    setProfiles(profMap);

    // like counts
    const { data: likesData } = await supabase
      .from("likes").select("post_id").in("post_id", postIds);
    const counts = {};
    postIds.forEach((id) => { counts[id] = 0; });
    (likesData || []).forEach(({ post_id }) => { counts[post_id] = (counts[post_id] || 0) + 1; });
    setLikeCounts(counts);

    // current user's likes
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: myLikes } = await supabase
        .from("likes").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds);
      setLikedPosts(new Set((myLikes || []).map((l) => l.post_id)));
    }

    // comment counts
    const { data: commentsData } = await supabase
      .from("comments").select("post_id").in("post_id", postIds);
    const cCounts = {};
    postIds.forEach((id) => { cCounts[id] = 0; });
    (commentsData || []).forEach(({ post_id }) => { cCounts[post_id] = (cCounts[post_id] || 0) + 1; });
    setCommentCounts(cCounts);
  };

  // ── like / unlike ─────────────────────────────────────────────
  const toggleLike = async (postId) => {
    if (!user || String(postId).startsWith("seed-")) return;
    const isLiked = likedPosts.has(postId);

    // optimistic
    setLikedPosts((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1) }));

    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    }
  };

  // ── comments ──────────────────────────────────────────────────
  const toggleComments = async (postId) => {
    if (String(postId).startsWith("seed-")) return;

    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); return next; }
      next.add(postId);
      return next;
    });

    if (!comments[postId]) {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(username, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setComments((prev) => ({ ...prev, [postId]: data || [] }));
    }
  };

  const submitComment = async (postId) => {
    const text = (commentDraft[postId] || "").trim();
    if (!text || !user) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, text })
      .select("*, profiles(username, avatar_url)")
      .single();

    if (!error && data) {
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
      setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      setCommentDraft((prev) => ({ ...prev, [postId]: "" }));
    }
    setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
  };

  // ── share ─────────────────────────────────────────────────────
  const handleShare = async (post) => {
    if (String(post.id).startsWith("seed-")) return;
    await supabase.from("posts").update({ shares_count: (post.shares_count || 0) + 1 }).eq("id", post.id);
    setDbPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, shares_count: (p.shares_count || 0) + 1 } : p));
    navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`).catch(() => {});
  };

  // ── image picker ──────────────────────────────────────────────
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

  // ── submit post ───────────────────────────────────────────────
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

      // REFRESH THE FEED HERE
      await loadPosts();

      setDraft("");
      clearImage();
    } catch (err) {
      setError(`Failed to post: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };
  // ── build post list ───────────────────────────────────────────
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
        likes: likeCounts[p.id] ?? 0,
        comments_count: commentCounts[p.id] ?? 0,
      };
    }),
    ...seedPosts,
  ];

  const filteredPosts = allPosts.filter((p) => {
    if (activeTab === "Following") return p.user_id === user?.id;
    if (activeTab === "Trending") return String(p.id).startsWith("seed-");
    return true;
  });

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 overflow-y-auto dark:bg-slate-900/50 backdrop-blur custom-scrollbar">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground">
            Share stories, photos, and memories with the Palestine Recorded community.
          </p>
        </div>

        {/* Compose box */}
        <form onSubmit={submitPost} className="rounded-xl border border-border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {(profiles[user?.id]?.username || "Y")[0].toUpperCase()}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={user ? "Share a story, photo, or memory..." : "Log in to share..."}
                disabled={!user}
                className="min-h-[60px] flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
              />
            </div>
            {imagePreview && (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-border">
                <img src={imagePreview} alt="preview" className="max-h-80 w-full object-cover" />
                <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {error && <div className="mt-2 rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-700 dark:text-red-400">{error}</div>}
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <div className="flex items-center gap-1">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                <ImageIcon className="h-4 w-4" /> Photo
              </button>
            </div>
            <button
              type="submit"
              disabled={(!draft.trim() && !imageFile) || posting || !user}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {posting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {["For you", "Following", "Trending"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isSeed = String(post.id).startsWith("seed-");
            const isLiked = likedPosts.has(post.id);
            const showComments = expandedComments.has(post.id);

            return (
              <article key={post.id} className="rounded-xl border border-border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
                <div className="flex items-start justify-between p-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${post.color ?? "bg-primary"}`}>
                      {post.avatar_url
                        ? <img src={post.avatar_url} alt="" className="h-full w-full object-cover" />
                        : (post.initial ?? post.author?.[0])}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground leading-tight">{post.author}</div>
                      <div className="text-xs italic text-muted-foreground">{post.role}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{post.time ?? timeAgo(post.created_at)}</span>
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
                  <div className="px-4 pb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.text}</div>
                )}
                {post.image_url && (
                  <div className="border-y border-border bg-muted">
                    <img src={post.image_url} alt="" className="w-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
                  <span>{post.likes ?? 0} likes</span>
                  <span>{post.comments_count ?? 0} comments · {post.shares_count ?? 0} shares</span>
                </div>

                <div className="flex items-center justify-around border-t border-border px-2 py-1">
                  <button
                    onClick={() => toggleLike(post.id)}
                    disabled={isSeed || !user}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 disabled:opacity-40 ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-primary"}`}
                  >
                    <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} /> Like
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    disabled={isSeed}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary disabled:opacity-40"
                  >
                    <MessageCircle className="h-4 w-4" /> Comment
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    disabled={isSeed}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary disabled:opacity-40"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>

                {/* Comments section */}
                {showComments && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    {(comments[post.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {(c.profiles?.username || "?")[0].toUpperCase()}
                        </div>
                        <div className="rounded-lg bg-accent/30 px-3 py-1.5 text-sm flex-1">
                          <span className="font-semibold text-foreground mr-1.5">{c.profiles?.username || "Member"}</span>
                          <span className="text-foreground">{c.text}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(c.created_at)}</div>
                        </div>
                      </div>
                    ))}

                    {user && (
                      <div className="flex gap-2 pt-1">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {(profiles[user.id]?.username || "Y")[0].toUpperCase()}
                        </div>
                        <div className="flex flex-1 gap-2">
                          <input
                            value={commentDraft[post.id] || ""}
                            onChange={(e) => setCommentDraft((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment(post.id)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-full border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <button
                            onClick={() => submitComment(post.id)}
                            disabled={!commentDraft[post.id]?.trim() || submittingComment[post.id]}
                            className="rounded-full p-1.5 text-primary hover:bg-accent/40 disabled:opacity-40"
                          >
                            {submittingComment[post.id]
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No posts to show in this section yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}