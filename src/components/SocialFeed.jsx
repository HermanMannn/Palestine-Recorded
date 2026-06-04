import { useEffect, useRef, useState, useCallback } from "react";
import {
  Image as ImageIcon, Video, Heart, MessageCircle, Share2,
  MoreHorizontal, Globe, X, Loader2, ArrowLeft, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import ProfilePage from "./Profilepage";

const GuestPrompt = ({ onClose, t }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-lg p-6 max-w-sm shadow-2xl">
      <h3 className="font-bold text-lg mb-2">{t('socialFeed.signUpToInteract')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('socialFeed.createAccountToComment')}</p>
      <button onClick={onClose} className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90">{t('socialFeed.gotIt')}</button>
    </div>
  </div>
);

const seedPosts = [
  {
    id: "seed-1", author: "Amr Bu-Gazala", role: "Former Palestinian Official",
    initial: "A", color: "bg-blue-500", time: "2h ago",
    text: "Sharing a photograph from my family archive — Jaffa, 1946. My grandfather's orange grove before everything changed. We must keep these memories alive for the next generation.",
    image_url: null, likes: 248, comments_count: 32, shares_count: 14, created_at: 0,
    seedKey: "amr",
  },
  {
    id: "seed-2", author: "Rawda Asfur", role: "Palestinian Journalist",
    initial: "R", color: "bg-pink-500", time: "5h ago",
    text: "Today I visited the village my grandmother was born in. The almond trees she always spoke about are still there. Some roots cannot be erased. 🌿",
    image_url: null, likes: 512, comments_count: 78, shares_count: 41, created_at: 0,
    seedKey: "rawda",
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

function timeAgo(ts, t) {
  if (!ts) return t('socialFeed.justNow');
  const time = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const diff = Math.max(0, Date.now() - time);
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('socialFeed.justNow');
  if (m < 60) return `${m}${t('socialFeed.minutesAgo')}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t('socialFeed.hoursAgo')}`;
  return `${Math.floor(h / 24)}${t('socialFeed.daysAgo')}`;
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

function PostCard({ post, onClick, onAuthorClick, liked, onToggleLike, isSelected, t }) {
  return (
    <article
      onClick={() => onClick(post)}
      className={`rounded-xl border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
        isSelected ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between p-4 pb-2">
        <div
          className="flex items-center gap-3 group"
          onClick={(e) => { e.stopPropagation(); onAuthorClick(post); }}
        >
          <Avatar post={post} />
          <div>
            <div className="font-semibold text-foreground leading-tight group-hover:text-primary group-hover:underline transition-colors cursor-pointer">
              {post.author}
            </div>
            <div className="text-xs italic text-muted-foreground">{post.role}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{post.time ?? timeAgo(post.created_at, t)}</span>
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
        <span>{(post.likes ?? 0)} {t('socialFeed.likes')}</span>
        <span>{post.comments_count ?? 0} {t('socialFeed.comments')} · {post.shares_count ?? 0} {t('socialFeed.shares')}</span>
      </div>

      <div className="flex items-center justify-around border-t border-border px-2 py-1">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(post.id); }}
          title={!post.isGuest ? "" : t('socialFeed.signUpToLike')}
          disabled={post.isGuest}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 disabled:opacity-50 disabled:cursor-not-allowed ${
            liked ? "text-red-500" : "text-muted-foreground hover:text-primary disabled:hover:bg-transparent"
          }`}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {t('socialFeed.like')}
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          title={!post.isGuest ? "" : t('socialFeed.signUpToComment')}
          disabled={post.isGuest}
          className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <MessageCircle className="h-4 w-4" /> {t('socialFeed.comment')}
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          title={!post.isGuest ? "" : t('socialFeed.signUpToShare')}
          disabled={post.isGuest}
          className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Share2 className="h-4 w-4" /> {t('socialFeed.share')}
        </button>
      </div>
    </article>
  );
}

function PostDetail({ post, liked, onToggleLike, onClose, onAuthorClick, user, profiles, currentUserAvatarUrl, t }) {
  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState(seedComments[post.id] || []);
  const [submitting, setSubmitting] = useState(false);

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentDraft.trim();
    if (!user) return;
    if (!text) return;
    setSubmitting(true);
    const prof = profiles[user.id];
    const newComment = {
      id: `local-${Date.now()}`,
      author: prof?.username || t('common.you'),
      initial: (prof?.username || "Y")[0].toUpperCase(),
      color: "bg-emerald-500",
      avatar_url: currentUserAvatarUrl || null,
      time: t('socialFeed.justNow'),
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
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-foreground">{t('socialFeed.post')}</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between p-4 pb-3">
          <button
            className="flex items-center gap-3 group text-left"
            onClick={() => onAuthorClick(post)}
          >
            <Avatar post={post} size="lg" />
            <div>
              <div className="font-semibold text-foreground group-hover:text-primary group-hover:underline transition-colors">
                {post.author}
              </div>
              <div className="text-xs italic text-muted-foreground">{post.role}</div>
            </div>
          </button>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {post.text && (
          <div className="px-4 pb-4 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
            {post.text}
          </div>
        )}

        {post.image_url && (
          <div className="border-y border-border bg-muted mb-3">
            <img src={post.image_url} alt="" className="w-full object-cover" />
          </div>
        )}

        <div className="px-4 pb-3 flex items-center gap-1.5 text-xs text-muted-foreground border-b border-border">
          <Globe className="h-3 w-3" />
          <span>{post.time ?? timeAgo(post.created_at, t)}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-border text-sm text-muted-foreground">
          <span><strong className="text-foreground">{post.likes ?? 0}</strong> {t('socialFeed.likes')}</span>
          <div className="flex gap-4">
            <span><strong className="text-foreground">{comments.length}</strong> {t('socialFeed.comments')}</span>
            <span><strong className="text-foreground">{post.shares_count ?? 0}</strong> {t('socialFeed.shares')}</span>
          </div>
        </div>

        <div className="flex items-center justify-around border-b border-border px-2 py-1">
          <button
            onClick={() => onToggleLike(post.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent/40 ${
              liked ? "text-red-500" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {t('socialFeed.like')}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
            <MessageCircle className="h-4 w-4" /> {t('socialFeed.comment')}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
            <Share2 className="h-4 w-4" /> {t('socialFeed.share')}
          </button>
        </div>

        <div className="divide-y divide-border">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 px-4 py-3">
              <Avatar post={c} size="sm" />
              <div className="flex-1">
                <div className="rounded-xl bg-muted/60 dark:bg-slate-700/50 px-3 py-2">
                  <div className="text-xs font-semibold text-foreground mb-0.5">{c.author}</div>
                  <div className="text-sm text-foreground leading-snug">{c.text}</div>
                </div>
                <div className="mt-1 flex items-center gap-3 px-1 text-xs text-muted-foreground">
                  <span>{c.time}</span>
                  <button className="font-medium hover:text-primary transition-colors">{t('socialFeed.like')}</button>
                  <button className="font-medium hover:text-primary transition-colors">{t('socialFeed.reply')}</button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">{t('socialFeed.noComments')}</div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3 bg-card/90 dark:bg-slate-800/80">
        <form onSubmit={submitComment} className="flex items-end gap-2">
          <Avatar post={currentUserPost} size="sm" />
          <div className="flex-1 flex items-end gap-2 rounded-xl border border-input bg-muted/40 dark:bg-slate-700/40 px-3 py-2">
            <textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(e); } }}
              placeholder={user ? t('socialFeed.writeComment') : t('socialFeed.loginToComment')}
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
  const { t, get } = useTranslation();
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
  const [activeTab, setActiveTab] = useState("forYou");
  const [selectedPost, setSelectedPost] = useState(null);
  const [profileView, setProfileView] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const requireAuth = (callback) => {
    if (!user) {
      setShowGuestPrompt(true);
      return;
    }
    callback();
  };

  useEffect(() => {
    let profileChannel;

    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id;
      setUser(authData.user || null);

      if (uid) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", uid)
          .maybeSingle();
        setCurrentUserAvatarUrl(prof?.avatar_url || null);

        profileChannel = supabase
          .channel("profile-social")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
            (payload) => setCurrentUserAvatarUrl(payload.new.avatar_url || null)
          )
          .subscribe();
      }

      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      setDbPosts(posts || []);
      const ids = [...new Set((posts || []).map((p) => p.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", ids);
        const map = {};
        (profs || []).forEach((p) => { map[p.id] = p; });
        setProfiles(map);
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
        author: prof?.username || t('common.member'),
        role: "Community Member",
        initial: (prof?.username || "M")[0].toUpperCase(),
        color: "bg-emerald-500",
        avatar_url: prof?.avatar_url,
      };
    }),
    ...seedPosts.map((post, index) => ({
      ...post,
      ...(get("socialFeed.seedPosts")[index] || {}),
    })),
  ];

  const filteredPosts = allPosts.filter((p) => {
    if (activeTab === "following") return p.user_id === user?.id;
    if (activeTab === "trending") return String(p.id).startsWith("seed-");
    return true;
  });

  useEffect(() => {
    if (!selectedPost) return;
    const updated = allPosts.find((p) => p.id === selectedPost.id);
    if (updated) setSelectedPost(updated);
  }, [dbPosts]);

  const toggleLike = async (id) => {
    const isLiked = !!liked[id];
    setLiked((prev) => ({ ...prev, [id]: !isLiked }));
    setDbPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, likes: (p.likes ?? 0) + (isLiked ? -1 : 1) } : p)
    );
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

  // Open profile panel for a post's author
  const openAuthorProfile = (post) => {
    setSelectedPost(null);
    if (post.user_id) {
      setProfileView({ userId: post.user_id });
    } else if (post.seedKey) {
      setProfileView({ seedKey: post.seedKey });
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
      const { error } = await supabase.from("posts").insert({ user_id: user.id, text, image_url });
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

  const panelOpen = !!selectedPost || !!profileView;

  const currentUserAvatarPost = {
    avatar_url: currentUserAvatarUrl,
    initial: (profiles[user?.id]?.username || "Y")[0].toUpperCase(),
    color: "bg-primary",
  };

  return (
    <div className="absolute inset-0 flex overflow-hidden dark:bg-slate-900/50 backdrop-blur">

      {/* ── Left panel: post detail OR profile ── */}
      <div
        className={`
          flex-shrink-0 border-r border-border bg-card/95 dark:bg-slate-800/95 backdrop-blur-sm
          transition-all duration-300 ease-in-out overflow-hidden
          ${panelOpen ? "w-full sm:w-[360px] lg:w-[420px]" : "w-0"}
        `}
        style={{ willChange: "width" }}
      >
        {profileView && (
          <ProfilePage
            userId={profileView.userId}
            seedKey={profileView.seedKey}
            onBack={() => setProfileView(null)}
          />
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
            t={t}
          />
        )}
      </div>

      {/* ── Feed ── */}
      <div
        className={`
          flex-1 overflow-y-auto custom-scrollbar transition-all duration-300
          ${panelOpen ? "hidden sm:block" : "block"}
        `}
      >
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('socialFeed.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('socialFeed.subtitle')}
            </p>
          </div>

          <form onSubmit={submitPost} className="rounded-xl border border-border bg-card/90 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
            <div className="p-4">
              <div className="flex gap-3">
                <Avatar post={currentUserAvatarPost} />
                <div className="flex-1 space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 500) setDraft(text);
                    }}
                    maxLength={500}
                    placeholder={user ? t('socialFeed.shareYourStory') : t('socialFeed.loginToShare')}
                    disabled={!user}
                    className="min-h-[60px] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                  />
                  <div className="text-xs text-muted-foreground text-right">{draft.length}/500</div>
                </div>
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
                  <ImageIcon className="h-4 w-4" /> {t('common.photo')}
                </button>
                <button type="button" className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <Video className="h-4 w-4" /> {t('common.video')}
                </button>
              </div>
              <button
                type="submit"
                disabled={(!draft.trim() && !imageFile) || posting || !user}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {posting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {posting ? t('socialFeed.posting') : t('socialFeed.post')}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 border-b border-border">
            {[
              ["forYou", t('socialFeed.forYou')],
              ["following", t('socialFeed.following')],
              ["trending", t('socialFeed.trending')],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

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
                t={t}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">{t('socialFeed.post')}</div>
            )}
          </div>
        </div>
      </div>

      {showGuestPrompt && <GuestPrompt onClose={() => setShowGuestPrompt(false)} t={t} />}
    </div>
  );
}
