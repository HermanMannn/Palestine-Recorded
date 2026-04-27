import { Link } from "@tanstack/react-router";
import logo from "@/assets/PalRecLogo.png";

export default function Navbar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-3 bg-card/90 backdrop-blur-sm border-b border-border">
      <Link to="/timeline" className="flex items-center gap-3">
        <img src={logo} alt="Palestine Recorded logo" className="h-9 w-auto" />
        <span className="text-xl font-bold tracking-tight text-foreground">
          Palestine Recorded
        </span>
      </Link>

      <nav className="flex items-center gap-8">
        <Link to="/timeline" className="text-base font-medium text-foreground hover:text-primary transition-colors">
          About
        </Link>
        <Link to="/timeline" className="text-base font-medium text-foreground hover:text-primary transition-colors">
          Donate
        </Link>
        <Link to="/timeline" className="text-base font-medium text-foreground hover:text-primary transition-colors">
          Contact Us
        </Link>
      </nav>
    </header>
  );
}
