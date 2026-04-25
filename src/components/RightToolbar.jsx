import { Link } from "@tanstack/react-router";
import { Home, Calendar, Grid3X3, MessageSquare, Settings, LogOut } from "lucide-react";

const tools = [
  { icon: Home, label: "Home", to: "/timeline" },
  { icon: Calendar, label: "Community", to: "/social" },
  { icon: Grid3X3, label: "Grid", to: "/palgrid" },
  { icon: MessageSquare, label: "Messages", to: "/messages" },
  { icon: Settings, label: "Settings", to: "/timeline" },
  { icon: LogOut, label: "Logout", to: "/" },
];

export default function RightToolbar() {
  return (
    <aside className="absolute top-0 right-0 z-10 flex h-full w-14 flex-col items-center gap-2 bg-card/90 backdrop-blur-sm border-l border-border py-4">
      {tools.map((tool) => (
        <Link
          key={tool.label}
          to={tool.to}
          title={tool.label}
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-accent/40 hover:text-primary transition-colors"
          activeProps={{ className: "bg-accent/40 text-primary" }}
        >
          <tool.icon className="h-5 w-5" />
        </Link>
      ))}
    </aside>
  );
}
