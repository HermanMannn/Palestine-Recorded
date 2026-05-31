import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Calendar, Grid3X3, MessageSquare, Settings, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import logoLight from "@/assets/PalRecLogo.png";
import logoDark from "@/assets/Logo_Dark.png";

const tools = [
  { icon: Home, label: "Home", to: "/timeline" },
  { icon: Calendar, label: "Community", to: "/social" },
  { icon: Grid3X3, label: "PalGrid", to: "/palgrid" },
  { icon: MessageSquare, label: "Messages", to: "/messages" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let channel;
    const loadProfile = async (userId) => {
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();
      setProfilePic(data?.avatar_url || null);
    };

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      loadProfile(uid);
      channel = supabase
        .channel("profile-nav")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
          (payload) => setProfilePic(payload.new.avatar_url || null))
        .subscribe();
    });

    return () => {
      observer.disconnect();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    localStorage.removeItem("palrec_user");
    navigate({ to: "/" });
  };

  return (
    <>
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3 bg-card/85 backdrop-blur-md border-b border-border/70">
        <Link to="/timeline" className="flex items-center gap-2.5 group">
          <img src={isDarkMode ? logoDark : logoLight} alt="Palestine Recorded logo" className="h-8 w-auto transition-transform group-hover:scale-105" />
          <span className="font-serif text-xl sm:text-2xl tracking-tight text-foreground hidden sm:block leading-none">
            Palestine Recorded
          </span>
        </Link>

        {/* Desktop primary tools - centered */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-0.5 bg-muted/40 border border-border/60 rounded-full px-1.5 py-1">
          {tools.map((tool) => (
            <Link
              key={tool.label}
              to={tool.to}
              title={tool.label}
              className="group relative flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "bg-card text-primary shadow-sm" }}
            >
              <tool.icon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{tool.label}</span>
            </Link>
          ))}
        </div>

        <nav className="flex items-center gap-1">
          <div className="hidden lg:flex items-center gap-0.5 mr-2">
            {[
              { to: "/about", label: "About" },
              { to: "/donate", label: "Donate" },
              { to: "/contact", label: "Contact" },
              { to: "/privacy", label: "Privacy" },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted/60 transition-colors"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>

          <Link
            to="/settings"
            title="Profile Settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-accent/20 border border-border/60 text-primary hover:from-primary/25 hover:to-accent/30 overflow-hidden transition-all"
          >
            {profilePic ? (
              <img src={profilePic} alt="User Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Link>
        </nav>
      </header>


      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-card/95 backdrop-blur-md border-t border-border px-2 py-2.5 pb-safe">
        {tools.map((tool) => (
          <Link
            key={tool.label}
            to={tool.to}
            className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            activeProps={{ className: "text-primary bg-primary/10" }}
          >
            <tool.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tool.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}