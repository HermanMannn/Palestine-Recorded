import { useState, useEffect } from "react";
import { User } from "lucide-react";

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
    <div className="min-h-screen bg-background/85 dark:bg-slate-900/40 backdrop-blur-xl text-foreground transition-colors duration-300 pb-20 overflow-x-hidden custom-scrollbar flex items-center justify-center">
      <main className="max-w-5xl w-full mx-auto px-6 py-16">
        
        {/* LOGO HEADER */}
        <div className="text-center mb-16">
          <img 
            src={isDarkMode ? logoDark : logoLight} 
            alt="PalRec Logo" 
            className="h-20 w-auto mx-auto mb-6 animate-in fade-in zoom-in duration-700" 
          />
        </div>

        {/* TEAM SECTION */}
        <section className="rounded-[3rem] border border-border bg-card/50 dark:bg-slate-800/60 p-12 md:p-20 text-center backdrop-blur-md shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-foreground tracking-tight">
            Developed by Midas Software Solutions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 mb-20">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <h5 className="font-bold text-2xl mb-1 text-foreground">{member.name} </h5>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-widest uppercase">{member.role} </p>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-border/40">
            <p className="text-xl text-yellow-600 text-muted-foreground italic">
              Lead by Dr. Manar Abu Talib 
            </p>
            <p className="text-base text-muted-foreground mt-2 font-medium opacity-80">
              University of Sharjah 
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}