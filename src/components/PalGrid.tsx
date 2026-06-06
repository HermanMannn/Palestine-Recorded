import { useEffect, useState, useCallback } from "react";
import { WORDS } from "../data/words";
import { PALESTINE_WORDS } from "../data/palestineWords";
import { useTranslation } from "@/hooks/useTranslation";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;
const WORD_SET = new Set(WORDS);

// Standard QWERTY keyboard layout
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

const KEY_STATUS_COLORS: Record<string, string> = {
  correct: "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]",
  present: "bg-amber-500 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.25)]",
  absent: "bg-zinc-800 border-zinc-700 text-zinc-500",
  unused: "bg-zinc-600/70 border-white/10 text-white hover:bg-zinc-500/80 active:scale-95",
};

const CELL_STATUS_COLORS: Record<string, string> = {
  correct: "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
  present: "bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  absent: "bg-zinc-800/80 border-zinc-900 text-zinc-500",
  empty: "bg-zinc-600/50 border-2 border-white/10 text-white",
  active: "bg-zinc-500/80 border-white/40 text-white scale-105 shadow-lg",
};

// Type definitions
type Cell = { letter: string; status: "correct" | "present" | "absent" | "" };
type KeyStatus = "correct" | "present" | "absent" | "unused";
type GameStatus = "playing" | "won" | "lost";
type GameMode = "daily" | "random";

// Palestine Time (Asia/Gaza) utilities
const getPalestineDateStr = () => {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", { timeZone: "Asia/Gaza" });
  const palestineDate = new Date(tzString);
  return `${palestineDate.getFullYear()}-${palestineDate.getMonth() + 1}-${palestineDate.getDate()}`;
};

// Daily word: deterministic hash based on date
const getDailyWord = () => {
  const dateString = getPalestineDateStr();
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALESTINE_WORDS[Math.abs(hash) % PALESTINE_WORDS.length];
};

// Seconds until midnight in Palestine timezone
const getSecondsUntilMidnightPalestine = () => {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", { timeZone: "Asia/Gaza" });
  const localTzNow = new Date(tzString);
  const nextMidnight = new Date(localTzNow);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.floor((nextMidnight.getTime() - localTzNow.getTime()) / 1000);
};

const getRandomWord = () => PALESTINE_WORDS[Math.floor(Math.random() * PALESTINE_WORDS.length)];

// Format seconds as HH:MM:SS
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// Wordle-style feedback: correct > present > absent
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

// SVG icon components
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mx-auto">
    <path d="M21 12H7l5-5M7 12l5 5" />
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

// UI Components
const ModeButton = ({ label, isActive, onClick, color }: { label: string; isActive: boolean; onClick: () => void; color: "emerald" | "violet" }) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onClick(); }}
    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-150 select-none touch-manipulation ${
      isActive ? `bg-${color}-600 text-white shadow` : "text-zinc-400 hover:text-white"
    }`}
  >
    {label}
  </button>
);

const IconButton = ({ onClick, title, icon: Icon, hoverColor = "text-white" }: { onClick: () => void; title: string; icon: React.ComponentType; hoverColor?: string }) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onClick(); }}
    className={`flex items-center justify-center px-2 py-1 rounded-full transition-all duration-150 select-none touch-manipulation text-zinc-400 hover:${hoverColor} hover:bg-white/10`}
    title={title}
  >
    <Icon />
  </button>
);

const HintButton = ({ onClick, cooldown, title, cooldownLabel }: { onClick: () => void; cooldown: number; title: string; cooldownLabel: string }) => {
  const isOnCooldown = cooldown > 0;
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={isOnCooldown}
      className={`flex items-center justify-center px-2 py-1 rounded-full transition-all duration-150 select-none touch-manipulation w-6 h-6 ${
        isOnCooldown
          ? "bg-zinc-700/50 text-zinc-500 cursor-not-allowed"
          : "text-zinc-400 hover:text-white hover:bg-white/10"
      }`}
      title={isOnCooldown ? `${cooldownLabel} ${cooldown}s` : title}
    >
      {isOnCooldown ? (
        <span className="text-xs font-bold">{cooldown}s</span>
      ) : (
        <span className="text-sm leading-none">💡</span>
      )}
    </button>
  );
};

const Keyboard = ({ handleKey, keyStatuses }: { handleKey: (key: string) => void; keyStatuses: Record<string, KeyStatus> }) => (
  <div className="lg:mt-6 flex flex-col items-center gap-1.5 w-full">
    {KEYBOARD_ROWS.map((row, ri) => (
      <div key={ri} className="flex gap-1 justify-center">
        {row.map((key) => {
          const isWide = key === "ENTER" || key === "BACK";
          const status = keyStatuses[key] || "unused";
          const bgClass = KEY_STATUS_COLORS[status];
          const sizeClass = isWide
            ? "px-2 sm:px-3 lg:px-4 text-[10px] sm:text-xs lg:text-sm min-w-[44px] sm:min-w-[52px] lg:min-w-[60px]"
            : "w-8 sm:w-10 lg:w-12 text-sm sm:text-base lg:text-lg";
          return (
            <button
              key={key}
              onPointerDown={(e) => { e.preventDefault(); handleKey(key); }}
              className={`select-none touch-manipulation ${sizeClass} h-12 sm:h-14 lg:h-16 rounded-lg border-2 font-bold uppercase transition-all duration-100 cursor-pointer ${bgClass}`}
            >
              {key === "BACK" ? <BackIcon /> : key}
            </button>
          );
        })}
      </div>
    ))}
  </div>
);

const GridCell = ({ cell, isCurrent }: { cell: Cell; isCurrent: boolean }) => {
  const letterChar = cell.letter;
  let bgClass = CELL_STATUS_COLORS.empty;

  if (cell.status) {
    bgClass = CELL_STATUS_COLORS[cell.status] || CELL_STATUS_COLORS.empty;
  } else if (letterChar.trim() && isCurrent) {
    bgClass = CELL_STATUS_COLORS.active;
  }

  return (
    <div
      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold uppercase rounded-lg border-2 transition-all duration-150 shadow-lg ${bgClass}`}
      style={{ boxShadow: letterChar.trim() ? undefined : "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
    >
      {letterChar.trim()}
    </div>
  );
};

const WordInfo = ({ word, category, arabic, meaning, context, meaningLabel, contextLabel }: { word: string; category: string; arabic: string; meaning: string; context: string; meaningLabel: string; contextLabel: string }) => (
  <div className="bg-zinc-800/80 border border-zinc-600/50 rounded-xl p-5 w-full text-left shadow-inner">
    <div className="flex justify-between items-start mb-3">
      <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
        {category}
      </span>
      <span className="text-2xl font-bold text-white/60">{arabic}</span>
    </div>
    <h3 className="text-emerald-400 font-bold text-xl mb-2 tracking-wide">{word}</h3>
    <p className="text-white/90 text-sm mb-3">
      <span className="font-semibold text-white/60 uppercase text-xs tracking-wider block mb-1">{meaningLabel}</span>
      {meaning}
    </p>
    <div className="border-l-2 border-emerald-500/60 pl-3">
      <span className="font-semibold text-white/60 uppercase text-xs tracking-wider block mb-1">{contextLabel}</span>
      <p className="text-white/80 text-sm italic leading-relaxed">{context}</p>
    </div>
  </div>
);

export default function PalGrid() {
  const { t } = useTranslation();
  const todayDateStr = getPalestineDateStr();
  const [mode, setMode] = useState<GameMode>("daily");
  const [targetData, setTargetData] = useState(() => getDailyWord());
  const answer = targetData.word.toUpperCase();

  const loadDailyState = () => {
    const saved = localStorage.getItem("palgrid-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.date === todayDateStr ? [parsed.guesses, parsed.status] : [[], "playing"];
    }
    return [[], "playing"];
  };

  const [dailyGuesses, setDailyGuesses] = useState<string[]>(() => loadDailyState()[0]);
  const [dailyStatus, setDailyStatus] = useState<GameStatus>(() => loadDailyState()[1]);
  const [randomGuesses, setRandomGuesses] = useState<string[]>([]);
  const [randomStatus, setRandomStatus] = useState<GameStatus>("playing");
  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [hintedLetters, setHintedLetters] = useState<Set<string>>(new Set());

  // Route reads and writes through the active mode so Daily and Random keep separate progress.
  const guesses = mode === "daily" ? dailyGuesses : randomGuesses;
  const status = mode === "daily" ? dailyStatus : randomStatus;
  const setGuesses = mode === "daily" ? setDailyGuesses : setRandomGuesses;
  const setStatus = mode === "daily" ? setDailyStatus : setRandomStatus;

  const startRandom = () => { setTargetData(getRandomWord()); setRandomGuesses([]); setRandomStatus("playing"); setCurrent(""); setError(""); setMode("random"); };
  const goDaily = () => { setTargetData(getDailyWord()); setCurrent(""); setError(""); setMode("daily"); };
  // Daily resets the same daily puzzle, while Random resets by choosing a fresh practice word.
  const resetGame = () => { setCurrent(""); setError(""); setHintedLetters(new Set()); setHintCooldown(0); if (mode === "daily") { setDailyGuesses([]); setDailyStatus("playing"); } else { setTargetData(getRandomWord()); setRandomGuesses([]); setRandomStatus("playing"); } };

  const resetDailyPuzzle = useCallback(() => {
    const nextDateStr = getPalestineDateStr();
    setTargetData(getDailyWord());
    setDailyGuesses([]);
    setDailyStatus("playing");
    setCurrent("");
    setError("");
    setHintedLetters(new Set());
    setHintCooldown(0);
    setTimeLeft(0);
    localStorage.setItem("palgrid-state", JSON.stringify({ date: nextDateStr, guesses: [], status: "playing" }));
  }, []);

  const giveHint = () => {
    if (hintCooldown > 0 || status !== "playing") return;

    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const answerLetters = new Set(answer.split(""));
    // A hint should reveal something new, not repeat a letter the player already tested.
    const guessedLetters = new Set([...guesses.join(""), ...current]);
    const wrongLetters = allLetters.filter(
      (letter) => !answerLetters.has(letter) && !hintedLetters.has(letter) && !guessedLetters.has(letter),
    );

    // If every wrong letter is already known, keep the button from feeling broken.
    if (wrongLetters.length === 0) {
      setError(t("palgrid.noMoreHints"));
      return;
    }

    const hintLetter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
    setError("");
    setHintedLetters((prev) => new Set([...prev, hintLetter]));
    setHintCooldown(30);
  };

  // Keyboard colors: correct > present > absent (upgrades only)
  const keyStatuses = useCallback((): Record<string, KeyStatus> => {
    const map: Record<string, KeyStatus> = {};
    for (const guess of guesses) {
      const cells = evaluate(guess, answer);
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const cellStatus = cells[i].status as KeyStatus;
        const existing = map[letter];
        if (!existing || existing === "unused") map[letter] = cellStatus;
        else if (existing === "absent" && cellStatus !== "absent") map[letter] = cellStatus;
        else if (existing === "present" && cellStatus === "correct") map[letter] = cellStatus;
      }
    }
    // Hinted letters behave like known misses, but never downgrade letters proven by guesses.
    for (const letter of hintedLetters) {
      if (!map[letter]) map[letter] = "absent";
    }
    return map;
  }, [guesses, answer, hintedLetters]);

  // Persist daily state to localStorage
  useEffect(() => {
    if (mode !== "daily") return;
    localStorage.setItem("palgrid-state", JSON.stringify({ date: todayDateStr, guesses: dailyGuesses, status: dailyStatus }));
  }, [dailyGuesses, dailyStatus, todayDateStr, mode]);

  // Countdown timer for daily mode
  useEffect(() => {
    let timer: number;
    if (mode === "daily" && dailyStatus !== "playing") {
      setTimeLeft(getSecondsUntilMidnightPalestine());
      timer = window.setInterval(() => {
        const remaining = getSecondsUntilMidnightPalestine();
        setTimeLeft(remaining);
        if (remaining <= 0) {
          resetDailyPuzzle();
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dailyStatus, mode, resetDailyPuzzle]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "ENTER") {
        if (current.length !== WORD_LENGTH) { setError(t("palgrid.notEnoughLetters")); setShake(true); setTimeout(() => setShake(false), 500); return; }
        const isStandardWord = WORD_SET.has(current) || WORD_SET.has(current.toLowerCase());
        const isPalestineWord = PALESTINE_WORDS.some((w) => w.word.toUpperCase() === current);
        if (!isStandardWord && !isPalestineWord) { setError(t("palgrid.notInWordList")); setShake(true); setTimeout(() => setShake(false), 500); return; }
        setError("");
        const newGuesses = [...guesses, current];
        setGuesses(newGuesses);
        setCurrent("");
        if (current === answer) setStatus("won");
        else if (newGuesses.length >= MAX_TRIES) setStatus("lost");
        return;
      }
      if (key === "BACK") { setCurrent((c) => c.slice(0, -1)); return; }
      if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) setCurrent((c) => c + key);
    },
    [current, guesses, status, answer, setGuesses, setStatus, t]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      // Do not steal typing from form fields elsewhere on the page.
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const k = e.key.toUpperCase();
      if (k === "ENTER" || k === "BACKSPACE" || /^[A-Z]$/.test(k)) { e.preventDefault(); handleKey(k === "BACKSPACE" ? "BACK" : k); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  // Auto-clear error messages after 3 seconds
  useEffect(() => { if (error) { const timer = setTimeout(() => setError(""), 3000); return () => clearTimeout(timer); } }, [error]);

  // Hint cooldown timer
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const timer = setInterval(() => {
      setHintCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hintCooldown]);

  const grid = [...guesses, current.padEnd(WORD_LENGTH, " ")];
  const statuses = keyStatuses();
  const modeColor = mode === "daily" ? "rgba(16, 185, 129, " : "rgba(139, 92, 246, ";

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 pt-[70px] dark:bg-slate-900/40 backdrop-blur-m transition-colors duration-300 custom-scrollbar overflow-y-auto">
      <div
        className="backdrop-blur p-6 sm:p-8 lg:p-8 rounded-[2.5rem] flex flex-col items-center gap-5 lg:gap-8 border-2 w-full max-w-md lg:max-w-6xl my-auto transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${modeColor}0.12) 0%, rgba(113, 113, 122, 0.35) 100%)`,
          borderColor: `${modeColor}0.3)`,
          boxShadow: `0 0 30px ${modeColor}0.15), 0 8px 32px rgba(0, 0, 0, 0.3)`,
        }}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 items-center lg:items-start w-full gap-5">
          <div className="flex flex-col items-center gap-1 w-full order-1 lg:gap-2 lg:col-start-1 lg:row-1">
            <h1 className="text-4xl lg:text-5xl text-white font-bold tracking-widest drop-shadow-lg">{t("palgrid.title")}</h1>
            <div className="flex gap-1 bg-zinc-800/60 rounded-full p-1 mt-1 border border-white/10">
              <ModeButton label={t("palgrid.daily")} isActive={mode === "daily"} onClick={goDaily} color="emerald" />
              <ModeButton label={t("palgrid.random")} isActive={mode === "random"} onClick={startRandom} color="violet" />
              <div className="w-px bg-white/20" />
              <IconButton onClick={resetGame} title={t("palgrid.resetGame")} icon={ResetIcon} />
              <HintButton onClick={giveHint} cooldown={hintCooldown} title={t("palgrid.getHint")} cooldownLabel={t("palgrid.hintAvailableIn")} />
            </div>
          </div>

          {error && <div className="text-xs bg-red-600/90 text-white px-4 py-1 rounded-full font-medium shadow-sm absolute top-24 z-10 animate-in fade-in slide-in-from-top-2">{error}</div>}

          <div className="flex flex-col items-center gap-1.5 w-full order-3 lg:col-start-1 lg:row-2 lg:gap-1">
            {status === "playing" ? (
              <Keyboard handleKey={handleKey} keyStatuses={statuses} />
            ) : (
              <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in slide-in-from-bottom-4 w-full lg:max-w-sm">
                <div className={`text-xl font-bold text-white px-6 py-3 rounded-xl border backdrop-blur-sm w-full text-center shadow-lg ${status === "won" ? "bg-emerald-600/20 border-emerald-500/30" : "bg-red-600/20 border-red-500/30"}`}>
                  {status === "won" ? t("palgrid.wellDone") : `${t("palgrid.wordWas")} ${answer}`}
                </div>
                <WordInfo word={targetData.word} category={targetData.category} arabic={targetData.arabic} meaning={targetData.meaning} context={targetData.context} meaningLabel={t("palgrid.meaning")} contextLabel={t("palgrid.context")} />
                {mode === "daily" ? (
                  <div className="text-center mt-2">
                    <p className="text-zinc-300 text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80">{t("palgrid.nextPuzzleIn")}</p>
                    <p className="text-3xl font-mono text-white tabular-nums drop-shadow-md">{formatTime(timeLeft)}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 mt-2 w-full">
                    <button onPointerDown={(e) => { e.preventDefault(); startRandom(); }} className="w-full py-3 rounded-xl bg-violet-600/80 hover:bg-violet-500/90 border border-violet-400/30 text-white font-bold uppercase tracking-widest text-sm transition-all duration-150 select-none touch-manipulation active:scale-95 shadow-lg">{t("palgrid.newRandomWord")}</button>
                    <button onPointerDown={(e) => { e.preventDefault(); goDaily(); }} className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest font-bold transition-colors select-none touch-manipulation">{t("palgrid.backToDaily")}</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 items-center justify-center order-1 lg:row-1 lg:row-span-2 lg:col-start-2 lg:pl-8 lg:border-l lg:border-white/10 lg:w-full">
            <div className="flex flex-col gap-2 lg:gap-3">
              {Array.from({ length: MAX_TRIES }).map((_, i) => {
                const evaluated = guesses[i] ? evaluate(guesses[i], answer) : null;
                const isCurrent = i === guesses.length && status === "playing";
                return (
                  <div key={i} className={`flex gap-2 lg:gap-3 ${isCurrent && shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
                    {Array.from({ length: WORD_LENGTH }).map((_, j) => {
                      const cell = evaluated?.[j] || { letter: grid[i]?.[j] || "", status: "" as const };
                      return <GridCell key={j} cell={cell} isCurrent={isCurrent} />;
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-sm text-zinc-200 text-center opacity-90 font-medium">
          {status === "playing" ? t("palgrid.playingHelp") : mode === "daily" ? t("palgrid.dailyResetHelp") : t("palgrid.practiceHelp")}
        </div>
      </div>
    </div>
  );
}
