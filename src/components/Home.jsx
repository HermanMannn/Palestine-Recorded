import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Map,
  Calendar,
  Grid3X3,
  MessageSquare,
  Users,
  PenSquare,
  Heart,
  MessageCircle,
  Globe,
  Leaf,
  Camera,
  UtensilsCrossed,
  Mic,
  Hash,
  ChevronRight,
  BookOpen,
  Sparkles,
  Quote,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import ChatBot from "./ChatBot.jsx";

/* ------------------------------------------------------------------ */
/* Curated content (no events table yet — swap to DB when available)   */
/* ------------------------------------------------------------------ */

const EVENTS = [
  {
    key: "embroidery",
    date: { day: "14", monthKey: "home.months.jun" },
    icon: Leaf,
    gradient: "from-emerald-500/90 via-emerald-700/90 to-emerald-950",
    locationKey: "home.events.embroideryLocation",
    time: "11:00 AM",
  },
  {
    key: "lens",
    date: { day: "21", monthKey: "home.months.jun" },
    icon: Camera,
    gradient: "from-amber-500/90 via-orange-700/90 to-orange-950",
    locationKey: "home.events.onlineEvent",
    time: "6:00 PM",
  },
  {
    key: "recipes",
    date: { day: "28", monthKey: "home.months.jun" },
    icon: UtensilsCrossed,
    gradient: "from-rose-500/90 via-rose-700/90 to-rose-950",
    locationKey: "home.events.recipesLocation",
    time: "4:00 PM",
  },
  {
    key: "oralHistory",
    date: { day: "05", monthKey: "home.months.jul" },
    icon: Mic,
    gradient: "from-sky-500/90 via-indigo-700/90 to-indigo-950",
    locationKey: "home.events.onlineEvent",
    time: "5:00 PM",
  },
];

const TRENDING = [
  { tag: "Jerusalem", posts: "1.2K" },
  { tag: "Heritage", posts: "980" },
  { tag: "Stories", posts: "756" },
  { tag: "Culture", posts: "642" },
  { tag: "Solidarity", posts: "591" },
];

const QUOTES = [
  { textKey: "home.quotes.darwish", author: "Mahmoud Darwish" },
  { textKey: "home.quotes.said", author: "Edward Said" },
  { textKey: "home.quotes.kanafani", author: "Ghassan Kanafani" },
];

/* Shared surface style for the glassy card look */
const CARD =
  "rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm";

/* ------------------------------------------------------------------ */

export default function Home() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [askInput, setAskInput] = useState("");
  const chatRef = useRef(null);

  const handleAsk = (question) => {
    const q = (question ?? askInput).trim();
    if (!q) return;
    setAskInput("");
    chatRef.current?.askQuestion(q);
  };

  // Rotate the daily quote by day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user || null);

      if (authData.user?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", authData.user.id)
          .maybeSingle();
        setUsername(prof?.username || null);
      }

      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (posts?.length) {
        const ids = [...new Set(posts.map((p) => p.user_id))];
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", ids);
        const map = {};
        (profs || []).forEach((p) => (map[p.id] = p));
        setRecentPosts(
          posts.map((p) => ({
            ...p,
            author: map[p.user_id]?.username || t("common.member"),
            avatar_url: map[p.user_id]?.avatar_url || null,
          }))
        );
      }
      setLoadingPosts(false);
    };
    init();
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t("home.feed.justNow");
    if (hours < 24) return `${hours}${t("home.feed.hoursAgo")}`;
    return `${Math.floor(hours / 24)}${t("home.feed.daysAgo")}`;
  };

  const features = [
    { icon: Map, to: "/timeline", titleKey: "home.explore.timeline", descKey: "home.explore.timelineDesc" },
    { icon: Users, to: "/social", titleKey: "home.explore.community", descKey: "home.explore.communityDesc" },
    { icon: Grid3X3, to: "/palgrid", titleKey: "home.explore.palgrid", descKey: "home.explore.palgridDesc" },
    { icon: MessageSquare, to: "/messages", titleKey: "home.explore.messages", descKey: "home.explore.messagesDesc" },
  ];

  const quickActions = [
    { icon: PenSquare, to: "/social", labelKey: "home.quickActions.createPost" },
    { icon: Map, to: "/timeline", labelKey: "home.quickActions.exploreTimeline" },
    { icon: Grid3X3, to: "/palgrid", labelKey: "home.quickActions.playPalgrid" },
    { icon: MessageSquare, to: "/messages", labelKey: "home.quickActions.sendMessage" },
  ];

  const SectionHeader = ({ title, to }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
      <Link
        to={to}
        className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {t("home.viewAll")}
        <ChevronRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </Link>
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto pb-24 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_310px] gap-6 items-start">

        {/* ---------------- Left sidebar (desktop) ---------------- */}
        <aside className="hidden lg:flex flex-col gap-5 sticky top-6">
          {/* Profile card */}
          <div className={`${CARD} p-5`}>
            {user ? (
              <Link to="/settings" className="flex items-center gap-3 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-800 text-primary-foreground font-bold shadow-md shadow-primary/20">
                  {(username || user.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {username || t("common.member")}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("home.viewProfile")}</p>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">{t("home.guestTitle")}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{t("home.guestSubtitle")}</p>
                <Link
                  to="/login"
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  {t("auth.login")}
                </Link>
              </div>
            )}
          </div>

          {/* Trending topics */}
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-bold tracking-tight text-foreground mb-4">
              {t("home.trending.title")}
            </h3>
            <ul className="flex flex-col gap-1">
              {TRENDING.map((topic) => (
                <li key={topic.tag}>
                  <Link
                    to="/social"
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 -mx-2 hover:bg-accent/10 group transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm text-foreground group-hover:text-primary transition-colors">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                        <Hash className="h-3 w-3 text-primary" />
                      </span>
                      {topic.tag}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {topic.posts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission blurb */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 backdrop-blur-md p-5">
            <div className="absolute -top-8 -end-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" aria-hidden="true" />
            <Leaf className="h-5 w-5 text-primary mb-2.5" />
            <p className="text-xs leading-relaxed text-foreground">{t("home.mission")}</p>
          </div>
        </aside>

        {/* ---------------- Main column ---------------- */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-border/60 shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/PalRecBG.png)" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/30 dark:from-background/97 dark:via-background/85 dark:to-background/50" />
            <div className="absolute -bottom-24 -start-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
            <div className="relative p-7 sm:p-12 max-w-2xl">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {t("home.heroTagline")}
              </p>
              <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {user && username
                  ? `${t("home.heroWelcomeBack")}, ${username}`
                  : t("home.heroTitle")}
              </h1>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                {t("home.heroSubtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/social"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/35 transition-all"
                >
                  <PenSquare className="h-4 w-4" />
                  {t("home.shareStory")}
                </Link>
                <Link
                  to="/timeline"
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm hover:border-primary/50 hover:text-primary transition-all"
                >
                  <Map className="h-4 w-4" />
                  {t("home.exploreTimeline")}
                </Link>
              </div>
            </div>
          </section>

          {/* Ask the AI Guide */}
          <section className="rounded-3xl p-[1.5px] bg-gradient-to-r from-primary/60 via-emerald-400/30 to-primary/60 shadow-lg shadow-primary/10">
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/90 backdrop-blur-xl p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-800 text-primary-foreground shadow-md shadow-primary/25">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  {t("home.askAi.title")}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4 ms-[42px]">
                {t("home.askAi.subtitle")}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder={t("home.askAi.placeholder")}
                  className="flex-1 min-w-0 rounded-full border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!askInput.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={t("home.askAi.button")}
                >
                  <Send className="h-4 w-4 rtl:-scale-x-100" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {["chip1", "chip2", "chip3"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleAsk(t(`home.askAi.${chip}`))}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95"
                  >
                    {t(`home.askAi.${chip}`)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Explore PalRec — feature cards (mobile/tablet emphasis) */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:hidden">
            {features.map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className={`${CARD} flex flex-col items-center gap-2.5 p-4 hover:border-primary/50 hover:-translate-y-0.5 transition-all`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </span>
                <span className="text-xs font-semibold text-foreground text-center">
                  {t(f.titleKey)}
                </span>
              </Link>
            ))}
          </section>

          {/* Upcoming events */}
          <section>
            <SectionHeader title={t("home.events.title")} to="/social" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {EVENTS.map((event) => (
                <div
                  key={event.key}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all"
                >
                  <div className={`relative h-28 bg-gradient-to-br ${event.gradient} flex items-center justify-center`}>
                    <event.icon className="h-9 w-9 text-white/85 transition-transform group-hover:scale-110" />
                    <div className="absolute top-3 start-3 rounded-xl bg-background/80 backdrop-blur-sm px-2.5 py-1 text-center shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-primary leading-none">
                        {t(event.date.monthKey)}
                      </p>
                      <p className="text-base font-bold tabular-nums text-foreground leading-tight">
                        {event.date.day}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                      {t(`home.events.${event.key}`)}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" /> {event.time}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 shrink-0" /> {t(event.locationKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community feed preview */}
          <section>
            <SectionHeader title={t("home.feed.title")} to="/social" />
            <div className="flex flex-col gap-3">
              {loadingPosts ? (
                <div className={`${CARD} p-8 text-center text-sm text-muted-foreground`}>
                  {t("common.loading")}
                </div>
              ) : recentPosts.length === 0 ? (
                <div className={`${CARD} p-8 text-center`}>
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </span>
                  <p className="text-sm text-muted-foreground">{t("home.feed.empty")}</p>
                  <Link
                    to="/social"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {t("home.feed.beFirst")} <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    to="/social"
                    className={`${CARD} block p-5 hover:border-primary/40 hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {post.avatar_url ? (
                        <img
                          src={post.avatar_url}
                          alt={post.author}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-border/50"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 text-white text-sm font-bold">
                          {post.author[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    {post.text && (
                      <p className="text-sm text-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.text}</p>
                    )}
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt=""
                        className="mt-3 rounded-xl max-h-64 w-full object-cover"
                      />
                    )}
                    <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5" /> {post.likes ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" /> {post.comments?.length ?? 0}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ---------------- Right sidebar (desktop) ---------------- */}
        <aside className="hidden lg:flex flex-col gap-5 sticky top-6">
          {/* Daily quote */}
          <div className={`${CARD} relative overflow-hidden p-5`}>
            <div className="absolute -top-10 -end-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl" aria-hidden="true" />
            <div className="flex items-center gap-2 mb-3">
              <Quote className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">{t("home.quoteTitle")}</h3>
            </div>
            <blockquote className="text-sm italic leading-relaxed text-foreground">
              “{t(quote.textKey)}”
            </blockquote>
            <p className="mt-3 text-xs font-semibold text-primary">— {quote.author}</p>
          </div>

          {/* PalGrid teaser */}
          <div className={`${CARD} p-5`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Grid3X3 className="h-4 w-4 text-primary" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-foreground">{t("home.palgrid.title")}</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground mb-3.5">
              {t("home.palgrid.subtitle")}
            </p>
            <div className="flex gap-1.5 mb-4" aria-hidden="true">
              {[
                "bg-primary text-primary-foreground",
                "bg-amber-500 text-white",
                "bg-muted text-muted-foreground",
                "bg-primary text-primary-foreground",
                "bg-muted text-muted-foreground",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold shadow-sm ${c}`}
                >
                  {"PALRC"[i]}
                </div>
              ))}
            </div>
            <Link
              to="/palgrid"
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              {t("home.palgrid.playNow")}
            </Link>
          </div>

          {/* Explore PalRec */}
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-bold tracking-tight text-foreground mb-3">
              {t("home.explore.title")}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {features.map((f) => (
                <li key={f.to}>
                  <Link
                    to={f.to}
                    className="flex items-center gap-3 rounded-xl p-2 -mx-1 hover:bg-accent/10 transition-colors group"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {t(f.titleKey)}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {t(f.descKey)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground ms-auto rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick actions */}
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-bold tracking-tight text-foreground mb-3">
              {t("home.quickActions.title")}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {quickActions.map((action) => (
                <li key={action.labelKey}>
                  <Link
                    to={action.to}
                    className="flex items-center gap-2.5 rounded-xl p-2 -mx-1 text-sm text-foreground hover:bg-accent/10 hover:text-primary transition-colors group"
                  >
                    <action.icon className="h-4 w-4 text-primary" />
                    {t(action.labelKey)}
                    <ChevronRight className="h-4 w-4 text-muted-foreground ms-auto rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Floating AI guide — shares its conversation across pages */}
      <ChatBot ref={chatRef} />
    </main>
  );
}
