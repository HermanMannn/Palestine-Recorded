import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Calendar, Grid3X3, MessageSquare, Settings, LogOut, User, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import logoLight from "@/assets/PalRecLogo.png";
import logoDark from "@/assets/Logo_Dark.png";

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  const tools = [
    { icon: Home, label: t('navbar.homeTitle'), to: "/timeline" },
    { icon: Calendar, label: t('navbar.communityTitle'), to: "/social" },
    { icon: Grid3X3, label: t('common.grid'), to: "/palgrid" },
    { icon: MessageSquare, label: t('navbar.messagesTitle'), to: "/messages" },
    { icon: Settings, label: t('navbar.settingsTitle'), to: "/settings" },
  ];

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
      setUser(data.user || null);
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
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-card/90 backdrop-blur-sm border-b border-border">
        <Link to="/timeline" className="flex items-center gap-2">
          <img src={isDarkMode ? logoDark : logoLight} alt={t('navbar.title')} className="h-9 w-auto" />
          <span className="text-base sm:text-lg font-bold tracking-tight text-foreground hidden sm:block">
            {t('navbar.title')}
          </span>
        </Link>

        {/* Desktop Tools - Hidden on Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
          {tools.map((tool) => {
            // Hide Settings for guests
            if (tool.to === "/settings" && !user) return null;
            return (
              <Link
                key={tool.label}
                to={tool.to}
                title={tool.label}
                className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent/40 hover:text-primary transition-colors"
                activeProps={{ className: "bg-accent/40 text-primary" }}
              >
                <tool.icon className="h-4 w-4" />
              </Link>
            );
          })}
          {user ? (
            <button
              onClick={handleLogout}
              title={t('navbar.logoutTitle')}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent/40 hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/"
              title={t('auth.login')}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent/40 hover:text-primary transition-colors"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          )}
        </div>

        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary hidden md:block">{t('navbar.aboutTitle')}</Link>
          <Link to="/donate" className="text-sm font-medium text-foreground hover:text-primary hidden md:block">{t('navbar.donateTitle')}</Link>
          <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary hidden md:block">{t('navbar.contactUsTitle')}</Link>
          <Link to="/privacy" className="text-sm font-medium text-foreground hover:text-primary hidden md:block">{t('common.privacy')}</Link>

          <LanguageSwitcher />

          {user ? (
            <Link
              to="/settings"
              title={t('navbar.profileSettingsTitle')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 overflow-hidden ml-1"
            >
              {profilePic ? (
                <img src={profilePic} alt={t('navbar.userProfileAlt')} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </Link>
          ) : (
            <Link
              to="/"
              title={t('auth.login')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 ml-1 transition-colors"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </header>


      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-card border-t border-border px-2 py-3 pb-safe">
        {tools.map((tool) => {
          // Hide Settings for guests
          if (tool.to === "/settings" && !user) return null;
          return (
            <Link
              key={tool.label}
              to={tool.to}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <tool.icon className="h-6 w-6" />
              <span className="text-[10px]">{tool.label}</span>
            </Link>
          );
        })}
        {!user && (
          <Link
            to="/"
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <LogIn className="h-6 w-6" />
            <span className="text-[10px]">{t('auth.login')}</span>
          </Link>
        )}
      </div>
    </>
  );
}
