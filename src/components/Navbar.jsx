import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Calendar, Grid3X3, MessageSquare, Settings, LogOut, User } from "lucide-react";

// Logo Imports
import logoLight from "@/assets/PalRecLogo.png";
import logoDark from "@/assets/Logo_Dark.png";

// Firebase Imports
import { db } from "../firebase"; 
import { ref, query, orderByChild, equalTo, onValue } from "firebase/database";

const tools = [
  { icon: Home, label: "Home", to: "/timeline" },
  { icon: Calendar, label: "Community", to: "/social" },
  { icon: Grid3X3, label: "Grid", to: "/palgrid" },
  { icon: MessageSquare, label: "Messages", to: "/messages" },
  { icon: Settings, label: "Settings", to: "/settings" },
  { icon: LogOut, label: "Logout", to: "/" },
];

export default function Navbar() {
  const [profilePic, setProfilePic] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // --- 1. THEME DETECTION ---
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    checkTheme();

    // Listen for theme changes (MutationObserver watches for class changes on <html>)
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // --- 2. USER DATA SYNC ---
    const saved = localStorage.getItem('palrec_user');
    const loggedInUser = saved ? JSON.parse(saved) : null;
    const targetUsername = loggedInUser?.username || "ahmed";

    const usersRef = ref(db, 'users');
    const userQuery = query(usersRef, orderByChild('username'), equalTo(targetUsername));
    
    const unsubscribe = onValue(userQuery, (snapshot) => {
      if (snapshot.exists()) {
        const userData = Object.values(snapshot.val())[0];
        setProfilePic(userData.profilePic || null);
      }
    });

    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, []);

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 bg-card/90 backdrop-blur-sm border-b border-border transition-colors duration-300">
      
      {/* TOP LEFT: App Logo (Swaps based on theme) */}
      <Link to="/timeline" className="flex items-center gap-3">
        <img 
          src={isDarkMode ? logoDark : logoLight} 
          alt="Palestine Recorded logo" 
          className="h-11 w-auto transition-all duration-300" 
        />
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground hidden sm:block">
          Palestine Recorded
        </span>
      </Link>

      {/* CENTER: Toolbar */}
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
      </div>

      {/* TOP RIGHT: Links & Profile Picture */}
      <nav className="flex items-center gap-6">
        <Link to="/about" className="text-base font-medium text-foreground hover:text-primary transition-colors hidden md:block">
          About
        </Link>
        <Link to="/donate" className="text-base font-medium text-foreground hover:text-primary transition-colors hidden md:block">
          Donate
        </Link>
        <Link to="/contact" className="text-base font-medium text-foreground hover:text-primary transition-colors hidden md:block">
          Contact Us
        </Link>
        
        {/* Profile Avatar */}
        <Link 
          to="/settings" 
          title="Profile Settings"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors overflow-hidden ml-2"
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