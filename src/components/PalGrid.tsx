import { useEffect, useState } from "react";
import { WORDS } from "../data/words";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;
const WORD_SET = new Set(WORDS);

type Cell = {
  letter: string;
  status: "correct" | "present" | "absent" | "";
};

export default function PalGrid() {
  const [answer] = useState(() => {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  });

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);

  useEffect(() => {
    let timer: number;
    if (status !== "playing") {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
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
        if (!WORD_SET.has(current)) {
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
    <div className="fixed inset-0 flex items-center justify-center p-4 dark:bg-slate-900/40 backdrop-blur-m transition-colors duration-300 custom-scrollbar">
      
      {/* Updated: Transparent Gray Container with Blur */}
      <div className="bg-zinc-700/40 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 border border-white/20 w-full max-w-sm ">
        
        <h1 className="text-4xl text-white font-bold tracking-widest drop-shadow-lg">PALGRID</h1>

        {error && (
          <div className="text-xs bg-red-600/90 text-white px-4 py-1 rounded-full font-medium shadow-sm">
            {error}
          </div>
        )}

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

        {status !== "playing" && (
          <div className="flex flex-col items-center gap-3 py-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-lg font-bold text-white bg-white/20 px-4 py-2 rounded-lg border border-white/30 backdrop-blur-sm">
              {status === "won" ? "Well Done! 🎉" : `Solution: ${answer}`}
            </div>
            
            <div className="text-center">
              <p className="text-zinc-200 text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80">New Game In</p>
              <p className="text-3xl font-mono text-white tabular-nums drop-shadow-md">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        )}

        <div className="text-[11px] text-zinc-200 text-center uppercase tracking-tighter opacity-70">
          {status === 'playing' ? "Type to start • Enter to submit" : "The puzzle resets daily"}
        </div>
      </div>
    </div>
  );
}