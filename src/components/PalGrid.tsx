import { useEffect, useState, useCallback } from "react";
import { WORDS } from "../data/words";
import { PALESTINE_WORDS } from "../data/palestineWords";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;
const WORD_SET = new Set(WORDS);

const getRandomWord = () =>
  PALESTINE_WORDS[Math.floor(Math.random() * PALESTINE_WORDS.length)];

// --- TIMEZONE & DAILY HELPERS ---

const getPalestineDateStr = () => {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", { timeZone: "Asia/Gaza" });
  const palestineDate = new Date(tzString);
  return `${palestineDate.getFullYear()}-${palestineDate.getMonth() + 1}-${palestineDate.getDate()}`;
};

const getDailyWord = () => {
  const dateString = getPalestineDateStr();
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALESTINE_WORDS.length;
  return PALESTINE_WORDS[index];
};

const getSecondsUntilMidnightPalestine = () => {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", { timeZone: "Asia/Gaza" });
  const localTzNow = new Date(tzString);
  const nextMidnight = new Date(localTzNow);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.floor((nextMidnight.getTime() - localTzNow.getTime()) / 1000);
};

type Cell = {
  letter: string;
  status: "correct" | "present" | "absent" | "";
};

type KeyStatus = "correct" | "present" | "absent" | "unused";

// Keyboard rows — standard Wordle layout
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

export default function PalGrid() {
  const todayDateStr = getPalestineDateStr();

  // "daily" = the fixed daily puzzle; "random" = a freshly-picked random word
  const [mode, setMode] = useState<"daily" | "random">("daily");

  const [targetData, setTargetData] = useState(() => getDailyWord());
  const answer = targetData.word.toUpperCase();

  // Daily state — persisted in localStorage
  const [dailyGuesses, setDailyGuesses] = useState<string[]>(() => {
    const saved = localStorage.getItem("palgrid-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayDateStr) return parsed.guesses;
    }
    return [];
  });
  const [dailyStatus, setDailyStatus] = useState<"playing" | "won" | "lost">(() => {
    const saved = localStorage.getItem("palgrid-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayDateStr) return parsed.status;
    }
    return "playing";
  });

  // Random-mode state — ephemeral, never touches localStorage
  const [randomGuesses, setRandomGuesses] = useState<string[]>([]);
  const [randomStatus, setRandomStatus] = useState<"playing" | "won" | "lost">("playing");

  // Active state depending on mode
  const guesses = mode === "daily" ? dailyGuesses : randomGuesses;
  const status  = mode === "daily" ? dailyStatus  : randomStatus;
  const setGuesses = mode === "daily" ? setDailyGuesses : setRandomGuesses;
  const setStatus  = mode === "daily" ? setDailyStatus  : setRandomStatus;

  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Switch to a brand-new random puzzle
  const startRandom = () => {
    setTargetData(getRandomWord());
    setRandomGuesses([]);
    setRandomStatus("playing");
    setCurrent("");
    setError("");
    setMode("random");
  };

  // Return to today's daily puzzle
  const goDaily = () => {
    setTargetData(getDailyWord());
    setCurrent("");
    setError("");
    setMode("daily");
  };

  // Derive per-letter keyboard status from all guesses so far
  const keyStatuses = useCallback((): Record<string, KeyStatus> => {
    const map: Record<string, KeyStatus> = {};
    for (const guess of guesses) {
      const cells = evaluate(guess, answer);
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const cellStatus = cells[i].status as KeyStatus;
        const existing = map[letter];
        if (!existing || existing === "unused") {
          map[letter] = cellStatus;
        } else if (existing === "absent" && cellStatus !== "absent") {
          map[letter] = cellStatus;
        } else if (existing === "present" && cellStatus === "correct") {
          map[letter] = cellStatus;
        }
      }
    }
    return map;
  }, [guesses, answer]);

  // Persist daily progress only
  useEffect(() => {
    if (mode !== "daily") return;
    localStorage.setItem(
      "palgrid-state",
      JSON.stringify({ date: todayDateStr, guesses: dailyGuesses, status: dailyStatus })
    );
  }, [dailyGuesses, dailyStatus, todayDateStr, mode]);

  // Countdown timer — only meaningful after the daily puzzle ends
  useEffect(() => {
    let timer: number;
    if (mode === "daily" && dailyStatus !== "playing") {
      setTimeLeft(getSecondsUntilMidnightPalestine());
      timer = window.setInterval(() => {
        const remaining = getSecondsUntilMidnightPalestine();
        setTimeLeft(remaining);
        if (remaining <= 0) window.location.reload();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dailyStatus, mode]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const evaluate = (guess: string, ans: string): Cell[] => {
    const res: Cell[] = Array.from({ length: WORD_LENGTH }, (_, i) => ({
      letter: guess[i] || "",
      status: "",
    }));
    const answerArr = ans.split("");
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

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === "ENTER") {
        if (current.length !== WORD_LENGTH) {
          setError("Not enough letters");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }

        const isStandardWord = WORD_SET.has(current) || WORD_SET.has(current.toLowerCase());
        const isPalestineWord = PALESTINE_WORDS.some(
          (w) => w.word.toUpperCase() === current
        );

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
    },
    [current, guesses, status, answer]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === "ENTER" || k === "BACKSPACE" || /^[A-Z]$/.test(k)) {
        e.preventDefault();
        handleKey(k === "BACKSPACE" ? "BACK" : k);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const grid = [...guesses, current.padEnd(WORD_LENGTH, " ")];
  const statuses = keyStatuses();

  // Colour logic for keyboard keys
  const keyBg = (key: string) => {
    const s = statuses[key];
    if (s === "correct")
      return "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]";
    if (s === "present")
      return "bg-amber-500 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.25)]";
    if (s === "absent") return "bg-zinc-800 border-zinc-700 text-zinc-500";
    return "bg-zinc-600/70 border-white/10 text-white hover:bg-zinc-500/80 active:scale-95";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 dark:bg-slate-900/40 backdrop-blur-m transition-colors duration-300 custom-scrollbar overflow-y-auto">
      <div className="bg-zinc-700/40 backdrop-blur-md p-6 sm:p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-5 border border-white/20 w-full max-w-md my-auto">
        
        <div className="flex flex-col items-center gap-1 w-full">
          <h1 className="text-4xl text-white font-bold tracking-widest drop-shadow-lg">
            PALGRID
          </h1>
          {/* Mode pill tabs */}
          <div className="flex gap-1 bg-zinc-800/60 rounded-full p-1 mt-1 border border-white/10">
            <button
              onPointerDown={(e) => { e.preventDefault(); goDaily(); }}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-150 select-none touch-manipulation ${
                mode === "daily"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Daily
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); startRandom(); }}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-150 select-none touch-manipulation ${
                mode === "random"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Random
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs bg-red-600/90 text-white px-4 py-1 rounded-full font-medium shadow-sm absolute top-24 z-10 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Game Grid */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: MAX_TRIES }).map((_, i) => {
            const word = grid[i] || "";
            const evaluated = guesses[i] ? evaluate(guesses[i], answer) : null;
            const isCurrent = i === guesses.length && status === "playing";

            return (
              <div
                key={i}
                className={`flex gap-2 ${
                  isCurrent && shake
                    ? "animate-[shake_0.4s_ease-in-out]"
                    : ""
                }`}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, j) => {
                  const letter = word[j] || "";
                  let bg =
                    "bg-zinc-600/50 border-2 border-white/10 text-white";

                  if (evaluated) {
                    if (evaluated[j].status === "correct")
                      bg =
                        "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                    else if (evaluated[j].status === "present")
                      bg =
                        "bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]";
                    else bg = "bg-zinc-800/80 border-zinc-900 text-zinc-500";
                  } else if (letter.trim() && isCurrent) {
                    bg =
                      "bg-zinc-500/80 border-white/40 text-white scale-105 shadow-lg";
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

        {/* Interactive On-Screen Keyboard */}
        {status === "playing" && (
          <div className="flex flex-col items-center gap-1.5 w-full mt-1">
            {KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((key) => {
                  const isWide = key === "ENTER" || key === "BACK";
                  return (
                    <button
                      key={key}
                      onPointerDown={(e) => {
                        e.preventDefault(); // prevent focus steal / double-fire on mobile
                        handleKey(key);
                      }}
                      className={`
                        select-none touch-manipulation
                        ${isWide ? "px-2 sm:px-3 text-[10px] sm:text-xs min-w-[44px] sm:min-w-[52px]" : "w-8 sm:w-10 text-sm sm:text-base"}
                        h-12 sm:h-14 rounded-lg border font-bold uppercase
                        transition-all duration-100 cursor-pointer
                        ${keyBg(key)}
                      `}
                    >
                      {key === "BACK" ? (
                        // Backspace icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 mx-auto"
                        >
                          <path d="M21 12H7l5-5M7 12l5 5" />
                        </svg>
                      ) : (
                        key
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Game Over / Educational Context */}
        {status !== "playing" && (
          <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in slide-in-from-bottom-4 w-full">
            <div
              className={`text-xl font-bold text-white px-6 py-3 rounded-xl border backdrop-blur-sm w-full text-center shadow-lg ${
                status === "won"
                  ? "bg-emerald-600/20 border-emerald-500/30"
                  : "bg-red-600/20 border-red-500/30"
              }`}
            >
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

              <h3 className="text-emerald-400 font-bold text-xl mb-2 tracking-wide">
                {targetData.word}
              </h3>

              <p className="text-white/90 text-sm mb-3">
                <span className="font-semibold text-white/60 uppercase text-xs tracking-wider block mb-1">
                  Meaning
                </span>
                {targetData.meaning}
              </p>

              <div className="border-l-2 border-emerald-500/60 pl-3">
                <span className="font-semibold text-white/60 uppercase text-xs tracking-wider block mb-1">
                  Context
                </span>
                <p className="text-white/80 text-sm italic leading-relaxed">
                  {targetData.context}
                </p>
              </div>
            </div>

            {mode === "daily" ? (
              <div className="text-center mt-2">
                <p className="text-zinc-300 text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80">
                  Next Puzzle In
                </p>
                <p className="text-3xl font-mono text-white tabular-nums drop-shadow-md">
                  {formatTime(timeLeft)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 mt-2 w-full">
                <button
                  onPointerDown={(e) => { e.preventDefault(); startRandom(); }}
                  className="w-full py-3 rounded-xl bg-violet-600/80 hover:bg-violet-500/90 border border-violet-400/30 text-white font-bold uppercase tracking-widest text-sm transition-all duration-150 select-none touch-manipulation active:scale-95 shadow-lg"
                >
                  New Random Word
                </button>
                <button
                  onPointerDown={(e) => { e.preventDefault(); goDaily(); }}
                  className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest font-bold transition-colors select-none touch-manipulation"
                >
                  ← Back to Daily
                </button>
              </div>
            )}
          </div>
        )}

        <div className="text-[11px] text-zinc-300 text-center uppercase tracking-tighter opacity-70">
          {status === "playing"
            ? "Type or tap • Enter to submit"
            : mode === "daily"
            ? "The puzzle resets daily at midnight (Palestine Time)"
            : "Practice mode — no streak affected"}
        </div>
      </div>
    </div>
  );
}
