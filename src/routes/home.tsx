import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from "@/components/Navbar.jsx";
import {
  Bookmark,
  PenSquare,
  CalendarDays,
  Users,
  Home as HomeIcon,
  Clock,
  MapPin,
  Globe,
  Grid3X3,
  ChevronRight,
  Plus,
  UserPlus,
  Languages,
  MoreHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Home — Palestine Recorded" },
      { name: "description", content: "Share stories, preserve culture, and connect with the Palestine Recorded community." },
    ],
  }),
});

const trending = [
  { tag: "Jerusalem", posts: "1.2K posts" },
  { tag: "Heritage", posts: "980 posts" },
  { tag: "Stories", posts: "756 posts" },
  { tag: "Culture", posts: "642 posts" },
  { tag: "Solidarity", posts: "591 posts" },
];

const events = [
  { m: "MAY", d: "24", title: "Olive Harvest Festival", when: "Sat, May 24 · 3:00 PM", where: "Ramallah, Palestine", icon: MapPin, img: "https://images.unsplash.com/photo-1601379329542-31c59cf0bcfe?w=600&q=70" },
  { m: "MAY", d: "27", title: "Embroidery Workshop", when: "Tue, May 27 · 11:00 AM", where: "Nablus Cultural Center", icon: MapPin, img: "https://images.unsplash.com/photo-1605040570917-3d76b54f9e8a?w=600&q=70" },
  { m: "JUN", d: "05", title: "Palestine Through Our Lens", when: "Thu, Jun 5 · 6:00 PM", where: "Online Event", icon: Globe, img: "https://images.unsplash.com/photo-1568576101779-3ba47ae57e84?w=600&q=70" },
  { m: "JUN", d: "12", title: "Traditional Recipes Exchange", when: "Thu, Jun 12 · 4:00 PM", where: "Gaza Community Hub", icon: MapPin, img: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&q=70" },
];

const communities = [
  { name: "Jerusalem Stories", members: "1.8K members", img: "https://images.unsplash.com/photo-1544734037-3477b1ec56a2?w=80&q=70" },
  { name: "Palestinian Cuisine", members: "1.4K members", img: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=80&q=70" },
  { name: "Heritage & Tradition", members: "2.2K members", img: "https://images.unsplash.com/photo-1605040570917-3d76b54f9e8a?w=80&q=70" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">
          {/* LEFT SIDEBAR */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">H</div>
                <div>
                  <div className="font-semibold text-foreground">Hamza</div>
                  <Link to="/settings" className="text-xs text-muted-foreground hover:text-primary">View profile</Link>
                </div>
              </div>
            </div>

            <nav className="rounded-xl border border-border bg-card p-2">
              {[
                { icon: HomeIcon, label: "Home", active: true },
                { icon: Bookmark, label: "My Bookmarks" },
                { icon: PenSquare, label: "My Posts" },
                { icon: CalendarDays, label: "My Events" },
                { icon: Users, label: "My Groups" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    item.active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-accent/40"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3">Trending Topics</h3>
              <ul className="space-y-2.5">
                {trending.map((t) => (
                  <li key={t.tag} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="text-muted-foreground">#</span>
                      {t.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{t.posts}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-3 text-sm font-medium text-primary hover:underline">View all</button>
            </div>

            <div className="rounded-xl border border-border bg-primary/5 p-4 text-sm text-foreground leading-relaxed">
              <span className="text-primary mr-1">🌿</span>
              Preserve our stories. Celebrate our culture. Inspire our future.
            </div>
          </aside>

          {/* CENTER */}
          <section className="space-y-6 min-w-0">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <img
                src="https://images.unsplash.com/photo-1544734037-3477b1ec56a2?w=1400&q=70"
                alt="Jerusalem skyline"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-100/85 via-rose-50/60 to-transparent" />
              <div className="relative p-8 md:p-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome to Palestine Recorded</h1>
                <p className="mt-3 max-w-md text-foreground/80">A space to share stories, preserve culture, and connect with our community.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                    <PenSquare className="h-4 w-4" /> Share a Story
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-card px-5 py-2.5 text-sm font-medium text-foreground border border-border hover:bg-accent/40">
                    <Users className="h-4 w-4" /> Explore Community
                  </button>
                </div>
                <div className="h-40 md:h-52" />
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
                <button className="text-sm font-medium text-primary hover:underline">View all</button>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {events.map((e) => (
                    <div key={e.title} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="relative h-28">
                        <img src={e.img} alt={e.title} className="h-full w-full object-cover" />
                        <div className="absolute top-2 left-2 bg-card rounded-md px-2 py-1 text-center shadow">
                          <div className="text-[10px] font-semibold text-muted-foreground">{e.m}</div>
                          <div className="text-sm font-bold text-foreground leading-none">{e.d}</div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 min-h-[2.5rem]">{e.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {e.when}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <e.icon className="h-3 w-3" />
                          {e.where}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="absolute -right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card border border-border shadow flex items-center justify-center text-foreground hover:bg-accent/40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Community Feed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">Community Feed</h2>
                <button className="text-sm font-medium text-primary hover:underline">See all</button>
              </div>
              <article className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-400 text-white flex items-center justify-center font-semibold">Y</div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">You</div>
                      <div className="text-xs text-muted-foreground">Community Member</div>
                      <div className="text-xs text-muted-foreground">8h ago · 🌍</div>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-5 w-5" /></button>
                </div>
                <p className="mt-3 text-sm text-foreground">
                  Sunset over Jerusalem never gets old. Our city is a story that has been written for thousands of years. 🇵🇸
                </p>
                <div className="mt-3 overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1544734037-3477b1ec56a2?w=1200&q=70"
                    alt="Jerusalem at sunset"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </article>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-5">
              <h3 className="font-semibold text-foreground mb-2">Daily Inspiration</h3>
              <p className="text-sm italic text-foreground/90">"We have on this earth what makes life worth living."</p>
              <p className="mt-3 text-xs text-muted-foreground">– Mahmoud Darwish</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Grid3X3 className="h-4 w-4 text-primary" /> Play PalGrid
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">A daily word game inspired by our words and heritage.</p>
                  <Link to="/palgrid" className="inline-block mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
                    Play Now
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-1 shrink-0">
                  {["M","O","T","O","M","O","T","E","M","O","S","T","M","O","N","T"].map((l, i) => (
                    <div key={i} className="h-6 w-6 rounded bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{l}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Active Communities</h3>
                <button className="text-xs font-medium text-primary hover:underline">See all</button>
              </div>
              <ul className="space-y-3">
                {communities.map((c) => (
                  <li key={c.name} className="flex items-center gap-3">
                    <img src={c.img} alt={c.name} className="h-9 w-9 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.members}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
              <ul className="space-y-1">
                {[
                  { icon: PenSquare, label: "Create a Post" },
                  { icon: CalendarDays, label: "Add an Event" },
                  { icon: Plus, label: "Join a Group" },
                  { icon: UserPlus, label: "Invite Friends" },
                ].map((a) => (
                  <li key={a.label}>
                    <button className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent/40">
                      <span className="flex items-center gap-3">
                        <a.icon className="h-4 w-4 text-muted-foreground" />
                        {a.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-primary/10 border-t border-border px-6 py-4">
        <div className="mx-auto max-w-[1480px] flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© 2024 Palestine Recorded. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <span className="hover:text-primary cursor-pointer">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer">Help Center</span>
            <span className="flex items-center gap-1"><Languages className="h-3 w-3" /> English</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
