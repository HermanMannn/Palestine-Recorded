import { useEffect, useState } from "react";
import { WORDS } from "../data/words";
import { PALESTINE_WORDS } from "../data/palestineWords";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;
const WORD_SET = new Set(WORDS);

// --- TIMEZONE & DAILY HELPERS ---

// 1. Get the current date string in Palestine (e.g., "2026-5-16")
const getPalestineDateStr = () => {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", { timeZone: "Asia/Gaza" });
  const palestineDate = new Date(tzString);
  return `${palestineDate.getFullYear()}-${palestineDate.getMonth() + 1}-${palestineDate.getDate()}`;
};

// 2. Hash the date to pick the exact same word for everyone playing today
const getDailyWord = () => {
  const dateString = getPalestineDateStr();
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALESTINE_WORDS.length;
  return PALESTINE_WORDS[index];
};

// 3. Calculate exact seconds until midnight in Palestine
const getSecondsUntilMidnightPalestine = () => {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", { timeZone: "Asia/Gaza" });
  const localTzNow = new Date(tzString); // The time it currently is in Palestine

  const nextMidnight = new Date(localTzNow);
  nextMidnight.setHours(24, 0, 0, 0); // Advance to midnight

  return Math.floor((nextMidnight.getTime() - localTzNow.getTime()) / 1000);
};

type Cell = {
  letter: string;
  status: "correct" | "present" | "absent" | "";
};

export default function PalGrid() {
  const todayDateStr = getPalestineDateStr();

  // Load the Daily Word
  const [targetData] = useState(() => getDailyWord());
  const answer = targetData.word.toUpperCase();

  // --- GAME STATE (With LocalStorage memory) ---
  const [guesses, setGuesses] = useState<string[]>(() => {
    const saved = localStorage.getItem("palgrid-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only load old guesses if they belong to today!
      if (parsed.date === todayDateStr) return parsed.guesses;
    }
    return [];
  });

  const [status, setStatus] = useState<"playing" | "won" | "lost">(() => {
    const saved = localStorage.getItem("palgrid-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayDateStr) return parsed.status;
    }
    return "playing";
  });

  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Save progress automatically whenever they guess or the status changes
  useEffect(() => {
    localStorage.setItem(
      "palgrid-state",
      JSON.stringify({
        date: todayDateStr,
        guesses,
        status,
      })
    );
  }, [guesses, status, todayDateStr]);

  // --- REAL-TIME CLOCK TIMER ---
  useEffect(() => {
    let timer: number;
    if (status !== "playing") {
      // Set time immediately so there isn't a 1-second delay
      setTimeLeft(getSecondsUntilMidnightPalestine());
      
      // Update the countdown every second
      timer = window.setInterval(() => {
        const remaining = getSecondsUntilMidnightPalestine();
        setTimeLeft(remaining);
        
        // If midnight hits while they are staring at the screen, refresh the page!
        if (remaining <= 0) {
          window.location.reload();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const evaluate = (guess: string): Cell[] => {
    const res: Cell[] = Array.from({ length: WORD_LENGTH }, (_, i) => ({
      letter: guess[i] || "",
      status: "",
    }));
    const answerArr = answer.split("");
    const used = Array(WORD_LENGTH).fill(false);

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === answerArr[i]) {
        res[i].status = "correct";
        used[i] = true;
      }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (res[i].status) continue;
      for (let j = 0; j < WORD_LENGTH; j++) {
        if (!used[j] && guess[i] === answerArr[j]) {
          res[i].status = "present";
          used[j] = true;
          break;
        }
      }
      if (!res[i].status) res[i].status = "absent";
    }
    return res;
  };

  useEffect(() => {
    const handleKey = (key: string) => {
      if (status !== "playing") return;
      
      if (key === "ENTER") {
        if (current.length !== WORD_LENGTH) {
          setError("Not enough letters");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }
        
        // Accept the guess if it's in the English dictionary OR the custom Palestine list
        const isStandardWord = WORD_SET.has(current) || WORD_SET.has(current.toLowerCase());
        const isPalestineWord = PALESTINE_WORDS.some(w => w.word.toUpperCase() === current);
        
        if (!isStandardWord && !isPalestineWord) {
          setError("Not in word list");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }
        
        setError("");
        const newGuesses = [...guesses, current];
        setGuesses(newGuesses);
        setCurrent("");
        
        if (current === answer) setStatus("won");
        else if (newGuesses.length >= MAX_TRIES) setStatus("lost");
        return;
      }
      
      if (key === "BACK") {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      
      if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
        setCurrent((c) => c + key);
      }
    };

    const handler = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === "ENTER" || k === "BACKSPACE" || /^[A-Z]$/.test(k)) {
        e.preventDefault();
        handleKey(k === "BACKSPACE" ? "BACK" : k);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, guesses, status, answer]);

  const grid = [...guesses, current.padEnd(WORD_LENGTH, " ")];

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 dark:bg-slate-900/40 backdrop-blur-m transition-colors duration-300 custom-scrollbar overflow-y-auto">
      
      <div className="bg-zinc-700/40 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 border border-white/20 w-full max-w-md my-auto">
        
        <h1 className="text-4xl text-white font-bold tracking-widest drop-shadow-lg">PALGRID</h1>

        {error && (
          <div className="text-xs bg-red-600/90 text-white px-4 py-1 rounded-full font-medium shadow-sm absolute top-24 z-10">
            {error}
          </div>
        )}

        {/* The Game Grid */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: MAX_TRIES }).map((_, i) => {
            const word = grid[i] || "";
            const evaluated = guesses[i] ? evaluate(guesses[i]) : null;
            const isCurrent = i === guesses.length && status === "playing";

            return (
              <div
                key={i}
                className={`flex gap-2 ${isCurrent && shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, j) => {
                  const letter = word[j] || "";
                  let bg = "bg-zinc-600/50 border-2 border-white/10 text-white";

                  if (evaluated) {
                    if (evaluated[j].status === "correct")
                      bg = "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                    else if (evaluated[j].status === "present")
                      bg = "bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]";
                    else
                      bg = "bg-zinc-800/80 border-zinc-900 text-zinc-500";
                  } else if (letter.trim() && isCurrent) {
                    bg = "bg-zinc-500/80 border-white/40 text-white scale-105 shadow-lg";
                  }

                  return (
                    <div
                      key={j}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl font-bold uppercase rounded-xl transition-all duration-150 ${bg}`}
                    >
                      {letter.trim()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* The "Game Over" Educational Context Box */}
        {status !== "playing" && (
          <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in slide-in-from-bottom-4 w-full">
            <div className={`text-xl font-bold text-white px-6 py-3 rounded-xl border backdrop-blur-sm w-full text-center shadow-lg ${status === "won" ? "bg-emerald-600/20 border-emerald-500/30" : "bg-red-600/20 border-red-500/30"}`}>
              {status === "won" ? "Well Done! 🎉" : `The word was: ${answer}`}
            </div>
            
            <div className="bg-zinc-800/80 border border-zinc-600/50 rounded-xl p-5 w-full text-left shadow-inner">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                  {targetData.category}
                </span>
                <span className="text-2xl font-bold text-white/60">
                  {targetData.arabic}
                </span>
              </div>

              <h3 className="text-emerald-400 font-bold text-xl mb-2 tracking-wide">{targetData.word}</h3>
              
              <p className="text-white/90 text-sm mb-3">
                <span className="font-semibold text-white/60 uppercase text-xs tracking-wider block mb-1">Meaning</span> 
                {targetData.meaning}
              </p>
              
              <div className="border-l-2 border-emerald-500/60 pl-3">
                <span className="font-semibold text-white/60 uppercase text-xs tracking-wider block mb-1">Context</span> 
                <p className="text-white/80 text-sm italic leading-relaxed">
                  {targetData.context}
                </p>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-zinc-300 text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80">Next Puzzle In</p>
              <p className="text-3xl font-mono text-white tabular-nums drop-shadow-md">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        )}

        <div className="text-[11px] text-zinc-300 text-center uppercase tracking-tighter opacity-70">
          {status === 'playing' ? "Type to start • Enter to submit" : "The puzzle resets daily at midnight (Palestine Time)"}
        </div>
      </div>
    </div>
  );
}