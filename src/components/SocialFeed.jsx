import { useEffect, useRef, useState, useCallback } from "react";
import {
  Image as ImageIcon, Video, Heart, MessageCircle, Share2,
  MoreHorizontal, Globe, X, Loader2, ArrowLeft, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
        : (post.initial ?? post.author?.[0] ?? "U")}
    </div>
  );
}

function PostCard({ post, onClick, liked, onToggleLike, isSelected }) {
  return (
    <article
      onClick={() => onClick(post)}
      className={`rounded-xl border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
        isSelected ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar post={post} />
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
        <button
          onClick={(e) => e.stopPropagation()}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {post.text && (
        <div className="px-4 pb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap line-clamp-4">{post.text}</div>
      )}

      {post.image_url && (
        <div className="border-y border-border bg-muted">
          <img src={post.image_url} alt="" className="w-full object-cover max-h-72" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
        <span>{(post.likes ?? 0)} likes</span>
        <span>{post.comments_count ?? 0} comments · {post.shares_count ?? 0} shares</span>
      </div>

      <div className="flex items-center justify-around border-t border-border px-2 py-1">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(post.id); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 ${
            liked ? "text-red-500" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> Like
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </article>
  );
}

function PostDetail({ post, liked, onToggleLike, onClose, user, profiles }) {
  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState([]);
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error || !data) return;
      if (isMounted) setComments(data);

      const missingProfileIds = [...new Set(data.map(c => c.user_id))].filter(id => !localProfiles[id]);
      if (missingProfileIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", missingProfileIds);
          
        if (profs && isMounted) {
          const newProfiles = { ...localProfiles };
          profs.forEach(p => { newProfiles[p.id] = p; });
          setLocalProfiles(newProfiles);
        }
      }
    };

    fetchComments();

    const channel = supabase
      .channel(`comments-${post.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` }, (payload) => {
        setComments((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [post.id, localProfiles]);

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentDraft.trim();
    if (!text || !user) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: post.id, user_id: user.id, text })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setComments((prev) => [...prev, data]);
        setCommentDraft("");
        
        await supabase
          .from("posts")
          .update({ comments_count: (post.comments_count || 0) + 1 })
          .eq("id", post.id);
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-foreground">Post</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Author row */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar post={post} size="lg" />
            <div>
              <div className="font-semibold text-foreground">{post.author}</div>
              <div className="text-xs italic text-muted-foreground">{post.role}</div>
            </div>
          </div>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Full post text */}
        {post.text && (
          <div className="px-4 pb-4 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
            {post.text}
          </div>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="border-y border-border bg-muted mb-3">
            <img src={post.image_url} alt="" className="w-full object-cover" />
          </div>
        )}

        {/* Timestamp + globe */}
        <div className="px-4 pb-3 flex items-center gap-1.5 text-xs text-muted-foreground border-b border-border">
          <Globe className="h-3 w-3" />
          <span>{post.time ?? timeAgo(post.created_at)}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border text-sm text-muted-foreground">
          <span><strong className="text-foreground">{post.likes ?? 0}</strong> Likes</span>
          <div className="flex gap-4">
            <span><strong className="text-foreground">{comments.length}</strong> Comments</span>
            <span><strong className="text-foreground">{post.shares_count ?? 0}</strong> Shares</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-around border-b border-border px-2 py-1">
          <button
            onClick={() => onToggleLike(post.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 ${
              liked ? "text-red-500" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> Like
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
            <MessageCircle className="h-4 w-4" /> Comment
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        {/* Comments */}
        <div className="divide-y divide-border">
          {comments.map((c) => {
            const authorProfile = localProfiles[c.user_id] || {};
            const authorName = authorProfile.username || "Member";
            const initial = authorName[0].toUpperCase();
            
            return (
              <div key={c.id} className="flex gap-3 px-4 py-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white bg-emerald-500`}>
                  {authorProfile.avatar_url ? (
                    <img src={authorProfile.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : initial}
                </div>
                <div className="flex-1">
                  <div className="rounded-xl bg-muted/60 dark:bg-slate-700/50 px-3 py-2">
                    <div className="text-xs font-semibold text-foreground mb-0.5">{authorName}</div>
                    <div className="text-sm text-foreground leading-snug">{c.text}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 px-1 text-xs text-muted-foreground">
                    <span>{timeAgo(c.created_at)}</span>
                    <button className="font-medium hover:text-primary transition-colors">Like</button>
                    <button className="font-medium hover:text-primary transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No comments yet. Be the first!
            </div>
          )}
        </div>
      </div>

      {/* Comment composer pinned at bottom */}
      <div className="shrink-0 border-t border-border p-3 bg-card/90 dark:bg-slate-800/80">
        <form onSubmit={submitComment} className="flex items-end gap-2">
          <Avatar
            post={{
              avatar_url: profiles[user?.id]?.avatar_url ?? null,
              initial: (profiles[user?.id]?.username || "U")[0].toUpperCase(),
              color: "bg-primary",
            }}
            size="sm"
          />
          <div className="flex-1 flex items-end gap-2 rounded-xl border border-input bg-muted/40 dark:bg-slate-700/40 px-3 py-2">
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
            <button
              type="submit"
              disabled={!commentDraft.trim() || submitting || !user}
              className="shrink-0 text-primary hover:text-primary/70 disabled:opacity-40 transition-colors"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
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
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("For you");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user || null;
      setUser(currentUser);

      // Fetch user's likes if logged in
      if (currentUser) {
        supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", currentUser.id)
          .then(({ data: userLikes }) => {
            if (userLikes) {
              const likesMap = {};
              userLikes.forEach((l) => { likesMap[l.post_id] = true; });
              setLiked(likesMap);
            }
          });
      }
    });

    const load = async () => {
      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      setDbPosts(data || []);
      
      const ids = [...new Set((data || []).map((p) => p.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, username, avatar_url").in("id", ids);
        const map = {};
        (profs || []).forEach((p) => { map[p.id] = p; });
        setProfiles(map);
      }
    };
    load();

    const channel = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setDbPosts((prev) => [payload.new, ...prev]);
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const allPosts = dbPosts.map((p) => {
    const prof = profiles[p.user_id];
    return {
      ...p,
      author: prof?.username || "Member",
      role: "Community Member",
      initial: (prof?.username || "M")[0].toUpperCase(),
      color: "bg-emerald-500",
      avatar_url: prof?.avatar_url,
    };
  });

  const filteredPosts = allPosts.filter((p) => {
    if (activeTab === "Following") return p.user_id === user?.id;
    return true;
  });

  // Keep all views properly ordered by chronological creation date
  filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  useEffect(() => {
    if (!selectedPost) return;
    const updated = allPosts.find((p) => p.id === selectedPost.id);
    if (updated) setSelectedPost(updated);
  }, [dbPosts]);

  const toggleLike = async (id) => {
    if (!user) return setError("Please log in to like posts.");

    const isLiked = !!liked[id];
    const increment = isLiked ? -1 : 1;
    
    // Optimistic UI update
    setLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setDbPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, likes: (p.likes ?? 0) + increment } : p)
    );
    
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => prev ? { ...prev, likes: (prev.likes ?? 0) + increment } : prev);
    }

    try {
      // 1. Insert or delete the user's like in the 'likes' table
      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", id)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: id, user_id: user.id });
      }

      // 2. Update the counter on the posts table
      const postToUpdate = dbPosts.find((p) => p.id === id);
      if (postToUpdate) {
        await supabase
          .from("posts")
          .update({ likes: (postToUpdate.likes ?? 0) + increment })
          .eq("id", id);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Optional: Revert optimistic update here if the DB call fails
    }
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
      const { error } = await supabase.from("posts").insert({ user_id: user.id, text, image_url, likes: 0, comments_count: 0 });
      if (error) throw error;
      
      if (!profiles[user.id]) {
        const { data: p } = await supabase.from("profiles").select("id, username, avatar_url").eq("id", user.id).maybeSingle();
        if (p) setProfiles((prev) => ({ ...prev, [p.id]: p }));
      }
      
      setDraft("");
      clearImage();
    } catch (err) {
      setError(`Failed to post: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  const panelOpen = !!selectedPost;

  return (
    <div className="absolute inset-0 flex overflow-hidden dark:bg-slate-900/50 backdrop-blur">

      {/* ── Detail panel (left) ─────────────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 border-r border-border bg-card/95 dark:bg-slate-800/95 backdrop-blur-sm
          transition-all duration-300 ease-in-out overflow-hidden
          ${panelOpen ? "w-full sm:w-[360px] lg:w-[420px]" : "w-0"}
        `}
        style={{ willChange: "width" }}
      >
        {selectedPost && (
          <PostDetail
            post={selectedPost}
            liked={!!liked[selectedPost.id]}
            onToggleLike={toggleLike}
            onClose={() => setSelectedPost(null)}
            user={user}
            profiles={profiles}
          />
        )}
      </div>

      {/* ── Feed (right) ────────────────────────────────────────────── */}
      <div
        className={`
          flex-1 overflow-y-auto custom-scrollbar transition-all duration-300
          ${panelOpen ? "hidden sm:block" : "block"}
        `}
      >
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
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
                  {(profiles[user?.id]?.username || "U")[0].toUpperCase()}
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
              {error && (
                <div className="mt-2 rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-700 dark:text-red-400">{error}</div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <div className="flex items-center gap-1">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <ImageIcon className="h-4 w-4" /> Photo
                </button>
                <button type="button" className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <Video className="h-4 w-4" /> Video
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
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={setSelectedPost}
                liked={!!liked[post.id]}
                onToggleLike={toggleLike}
                isSelected={selectedPost?.id === post.id}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No posts to show in this section yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}