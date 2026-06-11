import { useEffect, useState } from "react";
import { ArrowLeft, Globe, Heart, MessageCircle, Share2, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

function timeAgo(ts, t) {
  if (!ts) return t("socialFeed.justNow");
  const time = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const diff = Math.max(0, Date.now() - time);
  const m = Math.floor(diff / 60000);
  if (m < 1) return t("socialFeed.justNow");
  if (m < 60) return `${m}${t("socialFeed.minutesAgo")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t("socialFeed.hoursAgo")}`;
  return `${Math.floor(h / 24)}${t("socialFeed.daysAgo")}`;
}

// For seed / non-Supabase profiles (e.g. from the messages sidebar)
const SEED_PROFILES = {
  hamza: {
    username: "Hamza",
    bio: "Sharing stories and memories from Palestine.",
    avatar_url: null,
    initial: "H",
    color: "bg-orange-400",
    joined: "March 2024",
  },
  palrec: {
    username: "PalRec Devs",
    bio: "The team behind Palestine Recorded.",
    avatar_url: null,
    initial: "G",
    color: "bg-red-500",
    isGroup: true,
    joined: "January 2024",
  },
  amr: {
    username: "Amr Bu-Gazala",
    bio: "Former Palestinian Official. Keeper of memories.",
    avatar_url: null,
    initial: "A",
    color: "bg-blue-500",
    joined: "February 2024",
  },
  layla: {
    username: "Layla Haddad",
    bio: "Archivist and community historian.",
    avatar_url: null,
    initial: "L",
    color: "bg-purple-500",
    joined: "April 2024",
  },
};

const SEED_POSTS = [
  {
    id: "seed-1",
    author_key: "amr",
    text: "Sharing a photograph from my family archive — Jaffa, 1946. My grandfather's orange grove before everything changed. We must keep these memories alive for the next generation.",
    image_url: null,
    likes: 248,
    comments_count: 32,
    shares_count: 14,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "seed-2",
    author_key: "rawda",
    text: "Today I visited the village my grandmother was born in. The almond trees she always spoke about are still there. Some roots cannot be erased. 🌿",
    image_url: null,
    likes: 512,
    comments_count: 78,
    shares_count: 41,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

/**
 * ProfilePage
 *
 * Props:
 *   userId      — Supabase UUID (for real accounts). If provided, fetches from DB.
 *   seedKey     — key into SEED_PROFILES (for demo / seed contacts like "hamza", "amr").
 *   onBack      — callback to close/go back.
 */
export default function ProfilePage({ userId, seedKey, onBack }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLiked({});

      if (userId) {
        // Real Supabase profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("username, bio, avatar_url, created_at")
          .eq("id", userId)
          .maybeSingle();

        if (prof) {
          setProfile({
            username: prof.username || t("common.member"),
            bio: prof.bio || "",
            avatar_url: prof.avatar_url || null,
            initial: (prof.username || "M")[0].toUpperCase(),
            color: "bg-emerald-500",
            joined: prof.created_at
              ? new Date(prof.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : t("common.loading"),
          });
        }

        const { data: userPosts } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        setPosts(userPosts || []);
      } else if (seedKey) {
        // Seed / demo profile
        const seed = SEED_PROFILES[seedKey] || null;
        setProfile(seed || null);
        setPosts(SEED_POSTS.filter((p) => p.author_key === seedKey));
      }

      setLoading(false);
    };

    load();
  }, [userId, seedKey]);

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: (p.likes ?? 0) + (liked[id] ? -1 : 1) } : p
      )
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm">{t("profile.loading")}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("profile.notFound")}</p>
        <button onClick={onBack} className="text-sm text-primary hover:underline">{t("profile.goBack")}</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card/95 dark:bg-slate-800/95">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0">
        <button
          onClick={onBack}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-foreground">{profile.username}</span>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Cover band */}
        <div className="h-24 bg-gradient-to-br from-emerald-700/40 via-teal-600/30 to-slate-800/60 shrink-0" />

        {/* Avatar + meta */}
        <div className="px-5 pb-4 border-b border-border">
          {/* Avatar — overlaps the cover, z-10 keeps it above the gradient */}
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div
              className={`
                relative z-10
                flex h-20 w-20 shrink-0 items-center justify-center rounded-full
                text-2xl font-bold text-white ring-4 ring-card overflow-hidden
                ${profile.color ?? "bg-primary"}
              `}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                profile.isGroup ? <Users className="h-9 w-9" /> : profile.initial
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground leading-tight">{profile.username}</h2>

          {profile.bio && (
            <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {t("profile.joined")} {profile.joined}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {t("profile.public")}
            </span>
          </div>

          {/* Post count pill */}
          <div className="mt-3">
            <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>

        {/* ── Posts ── */}
        <div className="divide-y divide-border">
          {posts.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t("profile.noPostsYet")}
            </div>
          )}

          {posts.map((post) => (
            <article key={post.id} className="px-4 py-4 hover:bg-accent/10 transition-colors">
              {/* Post header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white overflow-hidden ${profile.color ?? "bg-primary"}`}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : profile.initial}
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{profile.username}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{timeAgo(post.created_at, t)}</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Post body */}
              {post.text && (
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap mb-3">
                  {post.text}
                </p>
              )}

              {post.image_url && (
                <div className="rounded-xl overflow-hidden border border-border mb-3">
                  <img src={post.image_url} alt="" className="w-full object-cover max-h-72" />
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{post.likes ?? 0} {t("socialFeed.likes")}</span>
                <span>{post.comments_count ?? 0} {t("socialFeed.comments")} · {post.shares_count ?? 0} {t("socialFeed.shares")}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-around border-t border-border/60 pt-1 -mx-1">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors hover:bg-accent/40 ${
                    liked[post.id] ? "text-red-500" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" fill={liked[post.id] ? "currentColor" : "none"} />
                  {t("socialFeed.like")}
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("socialFeed.comment")}
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent/40 hover:text-primary">
                  <Share2 className="h-3.5 w-3.5" />
                  {t("socialFeed.share")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
