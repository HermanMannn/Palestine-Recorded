import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Calendar, Grid3X3, MessageSquare, Settings, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import logoLight from "@/assets/PalRecLogo.png";
import logoDark from "@/assets/Logo_Dark.png";

const tools = [
  { icon: Home, label: "Home", to: "/timeline" },
  { icon: Calendar, label: "Community", to: "/social" },
  { icon: Grid3X3, label: "Grid", to: "/palgrid" },
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
    <header className="relative z-20 flex items-center justify-between px-6 py-5 bg-card/90 backdrop-blur-sm border-b border-border">
      <Link to="/timeline" className="flex items-center gap-3">
        <img src={isDarkMode ? logoDark : logoLight} alt="Palestine Recorded logo" className="h-11 w-auto" />
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground hidden sm:block">
          Palestine Recorded
        </span>
      </Link>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {tools.map((tool) => (
          <Link
            key={tool.label}
            to={tool.to}
            title={tool.label}
            className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent/40 hover:text-primary transition-colors"
            activeProps={{ className: "bg-accent/40 text-primary" }}
          >
            <tool.icon className="h-5 w-5" />
          </Link>
        ))}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent/40 hover:text-primary transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex items-center gap-6">
        <Link to="/about" className="text-base font-medium text-foreground hover:text-primary hidden md:block">About</Link>
        <Link to="/donate" className="text-base font-medium text-foreground hover:text-primary hidden md:block">Donate</Link>
        <Link to="/contact" className="text-base font-medium text-foreground hover:text-primary hidden md:block">Contact Us</Link>

        <Link
          to="/settings"
          title="Profile Settings"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 overflow-hidden ml-2"
        >
          {profilePic ? (
            <img src={profilePic} alt="User Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Link>
      </nav>
    </header>
  );
}
