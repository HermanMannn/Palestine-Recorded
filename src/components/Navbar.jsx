import { Link } from "@tanstack/react-router";
import { Home, Calendar, Grid3X3, MessageSquare, Settings, LogOut } from "lucide-react";
import logo from "@/assets/PalRecLogo.png";

const tools = [
  { icon: Home, label: "Home", to: "/timeline" },
  { icon: Calendar, label: "Community", to: "/social" },
  { icon: Grid3X3, label: "Grid", to: "/palgrid" },
  { icon: MessageSquare, label: "Messages", to: "/messages" },
  { icon: Settings, label: "Settings", to: "/timeline" },
  { icon: LogOut, label: "Logout", to: "/" },
];

export default function Navbar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 bg-card/90 backdrop-blur-sm border-b border-border">
      <Link to="/timeline" className="flex items-center gap-3">
        <img src={logo} alt="Palestine Recorded logo" className="h-11 w-auto" />
        <span className="text-2xl font-bold tracking-tight text-foreground">
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
      </div>

      <nav className="flex items-center gap-8">
        <Link to="/about" className="text-base font-medium text-foreground hover:text-primary transition-colors">
          About
        </Link>
        <Link to="/donate" className="text-base font-medium text-foreground hover:text-primary transition-colors">
          Donate
        </Link>
        <Link to="/contact" className="text-base font-medium text-foreground hover:text-primary transition-colors">
          Contact Us
        </Link>
      </nav>
    </header>
  );
}
