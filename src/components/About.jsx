import { useState, useEffect } from "react";
import { Users, Globe, ShieldCheck, Cpu, Database, Award, MessageSquare, User } from "lucide-react";

// Logo Imports
import logoLight from "@/assets/PalRecLogo.png";
import logoDark from "@/assets/Logo_Dark.png";

const team = [
  { name: "Ahmed Yacine Ahriche", role: "Chief Technology Officer" },
  { name: "EmadEddin Al-Chmri", role: "Chief Design Officer" },
  { name: "Isa Al-Khanous", role: "Chief Information Officer" },
  { name: "Mohammad Aziz Khodahafez", role: "Chief Product Officer" },
  { name: "Moheeb Suliman Musa", role: "Chief Operations Officer" },
  { name: "Nader Zamrawi", role: "Chief Communications Officer" },
];

export default function About() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background/85 dark:bg-slate-900/40 backdrop-blur-xl text-foreground transition-colors duration-300 pb-20 overflow-x-hidden custom-scrollbar">
      <main className="max-w-5xl mx-auto px-6 py-16">
        
        {/* HERO SECTION */}
        <section className="text-center mb-20">
          <img 
            src={isDarkMode ? logoDark : logoLight} 
            alt="PalRec Logo" 
            className="h-24 w-auto mx-auto mb-8 animate-in fade-in zoom-in duration-700" 
          />
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Preserving Identity, One Story at a Time [cite: 3]</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            For decades, the narrative surrounding Palestine has been dominated by conflict[cite: 1]. 
            <span className="text-foreground font-medium"> Palestine Recorded (PalRec)</span> is a web-based platform dedicated to preserving the rich tapestry of Palestinian heritage, culture, and traditions[cite: 2].
          </p>
        </section>

        {/* CORE MISSION TILES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-3xl border border-border bg-card/50 dark:bg-slate-800/60 backdrop-blur-md shadow-xl">
            <Globe className="h-10 w-10 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3">The Verified Timeline [cite: 5]</h2>
            <p className="text-muted-foreground">
              An unabridged record of historical events over a map layout of Palestine, supported by unbiased, verified sources[cite: 5].
            </p>
          </div>
          <div className="p-8 rounded-3xl border border-border bg-card/50 dark:bg-slate-800/60 backdrop-blur-md shadow-xl">
            <Users className="h-10 w-10 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3">The Community Timeline [cite: 6]</h2>
            <p className="text-muted-foreground">
              A dynamic space where Palestinians and historians can upload media, testimonies, and proof of cultural history[cite: 6].
            </p>
          </div>
        </div>

        {/* FEATURES GRID */}
        <section className="mb-20">
          <h3 className="text-3xl font-bold mb-10 text-center">Platform Ecosystem [cite: 7]</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: "Community Hub", desc: "Share posts and interact via a dedicated messaging system[cite: 8, 9]." },
              { icon: Award, title: "Reputation Points", desc: "Earn points for contributions that maintain the platform's integrity[cite: 9]." },
              { icon: Database, title: "PalGrid", desc: "Learn culture through a daily word puzzle featuring Palestine-related terms[cite: 10]." },
              { icon: ShieldCheck, title: "Strict Moderation", desc: "AI and human moderators ensure history remains free of misinformation[cite: 11]." },
              { icon: Cpu, title: "Future Tech", desc: "AI-driven chatbots to assist researchers and historians[cite: 13]." },
              { icon: Globe, title: "Blockchain", desc: "Confirming authorship to ensure legitimacy regardless of interference[cite: 13]." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card/30 dark:bg-slate-800/60 hover:border-emerald-500/50 transition-colors backdrop-blur-sm">
                <feature.icon className="h-6 w-6 text-emerald-500 mb-3" />
                <h4 className="font-bold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM SECTION */}
      
      </main>
    </div>
  );
}