import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  RotateCcw,
  Lightbulb,
  BarChart3,
  Volume2,
  VolumeX,
  X,
  Share2,
  Copy,
  Sparkles,
  Map,
  Delete,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WORDS } from "../data/words";
import { PALESTINE_WORDS } from "../data/palestineWords";
import { timelineData } from "./TimelineSidebar.jsx";
import { useTranslation } from "@/hooks/useTranslation";
import ChatBot from "./ChatBot.jsx";

const MAX_TRIES = 6;
const WORD_SET = new Set(WORDS);
const FLIP_MS = 560; // single tile flip duration
const STAGGER_MS = 160; // delay between tiles in a row
const SOUND_SRCS = ["/sounds/tile-flip-1.wav", "/sounds/tile-flip-2.wav"];
const SUCCESS_SOUND = "/sounds/palgrid-success.wav";
const HINT_SOUND = "/sounds/hint-click.wav";
const DAILY_EPOCH = Date.UTC(2026, 0, 1); // PalGrid #0

// Standard QWERTY keyboard layout
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

// Theme-aware status styles (work in both light and dark mode)
const CELL_STATUS_COLORS: Record<string, string> = {
  correct: "bg-primary border-primary text-primary-foreground shadow-[0_0_16px] shadow-primary/40",
  present: "bg-amber-500 border-amber-400 text-white shadow-[0_0_16px] shadow-amber-500/30",
  absent: "bg-muted border-border text-muted-foreground",
  empty: "bg-card/60 border-border/70 text-foreground",
  active: "bg-accent/15 border-primary/60 text-foreground",
};

const KEY_STATUS_COLORS: Record<string, string> = {
  correct: "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25",
  present: "bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-500/20",
  absent: "bg-muted/70 border-transparent text-muted-foreground/50",
  unused: "bg-secondary border-border/60 text-secondary-foreground hover:bg-accent/15",
};

// Type definitions
type Cell = { letter: string; status: "correct" | "present" | "absent" | "" };
type KeyStatus = "correct" | "present" | "absent" | "unused";
type GameStatus = "playing" | "won" | "lost";
type GameMode = "daily" | "random";
type Stats = { played: number; won: number; streak: number; maxStreak: number; dist: number[]; lastIndex: number };

const EMPTY_STATS: Stats = { played: 0, won: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0], lastIndex: -10 };

// ===== Palestine Time (Asia/Gaza) utilities =====

const getPalestineNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Gaza" }));

const getPalestineDateStr = () => {
  const d = getPalestineNow();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Sequential daily index → no word repeats until the full list cycles
const getDailyIndex = () => {
  const d = getPalestineNow();
  const todayUTC = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(0, Math.floor((todayUTC - DAILY_EPOCH) / 86400000));
};

const getDailyWord = () => PALESTINE_WORDS[getDailyIndex() % PALESTINE_WORDS.length];

const getSecondsUntilMidnightPalestine = () => {
  const localTzNow = getPalestineNow();
  const nextMidnight = new Date(localTzNow);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.floor((nextMidnight.getTime() - localTzNow.getTime()) / 1000);
};

const getRandomWord = () => PALESTINE_WORDS[Math.floor(Math.random() * PALESTINE_WORDS.length)];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// ===== Game logic =====

// Wordle-style feedback: correct > present > absent (variable word length)
const evaluate = (guess: string, ans: string): Cell[] => {
  const len = ans.length;
  const res: Cell[] = Array.from({ length: len }, (_, i) => ({ letter: guess[i] || "", status: "" }));
  const answerArr = ans.split("");
  const used = Array(len).fill(false);

  for (let i = 0; i < len; i++) {
    if (guess[i] === answerArr[i]) {
      res[i].status = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < len; i++) {
    if (res[i].status) continue;
    for (let j = 0; j < len; j++) {
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

// Tile sizing adapts to word length so 7-letter words fit on phones
const getCellSize = (len: number) => {
  if (len <= 5) return "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-2xl sm:text-3xl";
  if (len === 6) return "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-xl sm:text-2xl";
  return "w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 text-lg sm:text-xl";
};

// Emoji share grid
const buildShareText = (guesses: string[], answer: string, won: boolean, dailyIndex: number) => {
  const rows = guesses
    .map((g) =>
      evaluate(g, answer)
        .map((c) => (c.status === "correct" ? "🟩" : c.status === "present" ? "🟨" : "⬛"))
        .join("")
    )
    .join("\n");
  return `PalGrid #${dailyIndex} ${won ? guesses.length : "X"}/${MAX_TRIES}\n\n${rows}`;
};

// ===== Persistence =====

const loadStats = (): Stats => {
  if (typeof window === "undefined") return EMPTY_STATS;
  try {
    const s = JSON.parse(localStorage.getItem("palgrid-stats") || "");
    if (s && typeof s.played === "number") return { ...EMPTY_STATS, ...s };
  } catch { /* fresh start */ }
  return EMPTY_STATS;
};

const vibrate = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch { /* unsupported */ }
};

// ===== Small components =====

function FlipCell({ letter, status, delay, sizeClass }: { letter: string; status: string; delay: number; sizeClass: string }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setFlipped(true)));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={`pg-tile ${sizeClass}`}>
      <div className={`pg-tile-inner ${flipped ? "pg-flip" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className={`pg-face border-2 rounded-lg font-bold uppercase ${CELL_STATUS_COLORS.empty}`}>{letter}</div>
        <div className={`pg-face pg-face-back border-2 rounded-lg font-bold uppercase ${CELL_STATUS_COLORS[status] || CELL_STATUS_COLORS.empty}`}>
          {letter}
        </div>
      </div>
    </div>
  );
}

function StaticCell({ cell, isCurrent, sizeClass, dance, danceDelay }: { cell: Cell; isCurrent: boolean; sizeClass: string; dance?: boolean; danceDelay?: number }) {
  let bgClass = CELL_STATUS_COLORS.empty;
  if (cell.status) bgClass = CELL_STATUS_COLORS[cell.status] || CELL_STATUS_COLORS.empty;
  else if (cell.letter.trim() && isCurrent) bgClass = CELL_STATUS_COLORS.active;

  return (
    <div
      className={`${sizeClass} flex items-center justify-center font-bold uppercase rounded-lg border-2 transition-all duration-150 ${bgClass} ${
        dance ? "pg-dance" : ""
      } ${cell.letter.trim() && isCurrent ? "pg-pop" : ""}`}
      style={dance ? { animationDelay: `${danceDelay}ms` } : undefined}
    >
      {cell.letter.trim()}
    </div>
  );
}

// ===== Main component =====

export default function PalGrid() {
  const { t } = useTranslation();
  const todayDateStr = getPalestineDateStr();
  const dailyIndex = getDailyIndex();
  const chatRef = useRef<{ askQuestion: (q: string) => void } | null>(null);

  const [mode, setMode] = useState<GameMode>("daily");
  const [targetData, setTargetData] = useState(() => getDailyWord());
  const answer = targetData.word.toUpperCase();
  const wordLen = answer.length;
  const sizeClass = getCellSize(wordLen);

  const loadDailyState = () => {
    if (typeof window === "undefined") return { guesses: [], status: "playing" as GameStatus, hinted: [] as string[] };
    try {
      const parsed = JSON.parse(localStorage.getItem("palgrid-state") || "");
      if (parsed?.date === todayDateStr) {
        return { guesses: parsed.guesses || [], status: parsed.status || "playing", hinted: parsed.hinted || [] };
      }
    } catch { /* fresh day */ }
    return { guesses: [], status: "playing" as GameStatus, hinted: [] as string[] };
  };

  const [dailyGuesses, setDailyGuesses] = useState<string[]>(() => loadDailyState().guesses);
  const [dailyStatus, setDailyStatus] = useState<GameStatus>(() => loadDailyState().status);
  const [randomGuesses, setRandomGuesses] = useState<string[]>([]);
  const [randomStatus, setRandomStatus] = useState<GameStatus>("playing");
  const [current, setCurrent] = useState("");
  const [toast, setToast] = useState<{ text: string; kind: "error" | "success" } | null>(null);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [hintedLetters, setHintedLetters] = useState<Set<string>>(() => new Set(loadDailyState().hinted));
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [dance, setDance] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [showStats, setShowStats] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => typeof window !== "undefined" && localStorage.getItem("palgrid-sound") === "off");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const pressedTimerRef = useRef<number | undefined>(undefined);

  // Light up the on-screen key when the physical keyboard is used
  const flashKey = useCallback((key: string) => {
    setPressedKey(key);
    window.clearTimeout(pressedTimerRef.current);
    pressedTimerRef.current = window.setTimeout(() => setPressedKey(null), 140);
  }, []);

  // Route reads and writes through the active mode so Daily and Random keep separate progress.
  const guesses = mode === "daily" ? dailyGuesses : randomGuesses;
  const status = mode === "daily" ? dailyStatus : randomStatus;
  const setGuesses = mode === "daily" ? setDailyGuesses : setRandomGuesses;
  const setStatus = mode === "daily" ? setDailyStatus : setRandomStatus;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  // ----- Sound -----
  // One randomized, pitch-shifted flip sound per typed letter (lower pitch for backspace)
  const playTileSound = useCallback(
    (rateMin = 0.95, rateMax = 1.25, volume = 0.4) => {
      if (muted) return;
      try {
        const audio = new Audio(SOUND_SRCS[Math.random() < 0.5 ? 0 : 1]);
        // Disable pitch preservation so playbackRate naturally shifts pitch
        (audio as HTMLAudioElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean }).preservesPitch = false;
        (audio as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = false;
        audio.playbackRate = rateMin + Math.random() * (rateMax - rateMin);
        audio.volume = volume;
        audio.play().catch(() => {});
      } catch { /* audio unavailable */ }
    },
    [muted]
  );

  const playSuccessSound = useCallback(() => {
    if (muted) return;
    try {
      const audio = new Audio(SUCCESS_SOUND);
      audio.volume = 0.55;
      audio.play().catch(() => {});
    } catch { /* audio unavailable */ }
  }, [muted]);

  const toggleMute = () => {
    setMuted((m) => {
      localStorage.setItem("palgrid-sound", m ? "on" : "off");
      return !m;
    });
  };

  // ----- Mode switching (clears hints so they can't leak across words) -----
  const clearTransient = () => {
    setCurrent("");
    setToast(null);
    setHintedLetters(new Set());
    setHintCooldown(0);
    setRevealRow(null);
    setDance(false);
  };

  const startRandom = () => {
    setTargetData(getRandomWord());
    setRandomGuesses([]);
    setRandomStatus("playing");
    clearTransient();
    setMode("random");
  };

  const goDaily = () => {
    setTargetData(getDailyWord());
    clearTransient();
    setHintedLetters(new Set(loadDailyState().hinted));
    setMode("daily");
  };

  // Reset only exists for practice mode — the daily puzzle is one attempt per day.
  const resetRandom = () => {
    setTargetData(getRandomWord());
    setRandomGuesses([]);
    setRandomStatus("playing");
    clearTransient();
  };

  const resetDailyPuzzle = useCallback(() => {
    const nextDateStr = getPalestineDateStr();
    setTargetData(getDailyWord());
    setDailyGuesses([]);
    setDailyStatus("playing");
    clearTransient();
    setTimeLeft(0);
    localStorage.setItem("palgrid-state", JSON.stringify({ date: nextDateStr, guesses: [], status: "playing", hinted: [] }));
  }, []);

  // ----- Hints -----
  const giveHint = () => {
    if (hintCooldown > 0 || status !== "playing" || revealRow !== null) return;

    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const answerLetters = new Set(answer.split(""));
    const guessedLetters = new Set([...guesses.join(""), ...current]);
    const wrongLetters = allLetters.filter(
      (letter) => !answerLetters.has(letter) && !hintedLetters.has(letter) && !guessedLetters.has(letter)
    );

    if (wrongLetters.length === 0) {
      setToast({ text: t("palgrid.noMoreHints"), kind: "error" });
      return;
    }

    const hintLetter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
    if (!muted) {
      try {
        const audio = new Audio(HINT_SOUND);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch { /* audio unavailable */ }
    }
    setHintedLetters((prev) => new Set([...prev, hintLetter]));
    setHintCooldown(30);
  };

  // ----- Stats -----
  const recordResult = useCallback(
    (won: boolean, tries: number) => {
      if (mode !== "daily") return;
      setStats((prev) => {
        const next: Stats = {
          played: prev.played + 1,
          won: prev.won + (won ? 1 : 0),
          streak: won ? (dailyIndex - prev.lastIndex === 1 ? prev.streak + 1 : 1) : 0,
          maxStreak: prev.maxStreak,
          dist: [...prev.dist],
          lastIndex: won ? dailyIndex : prev.lastIndex,
        };
        if (won) next.dist[tries - 1] += 1;
        next.maxStreak = Math.max(next.maxStreak, next.streak);
        localStorage.setItem("palgrid-stats", JSON.stringify(next));
        return next;
      });
    },
    [mode, dailyIndex]
  );

  // ----- Keyboard colors (revealing row excluded until its flip finishes) -----
  const visibleGuesses = revealRow !== null ? guesses.slice(0, revealRow) : guesses;
  const keyStatuses = useMemo((): Record<string, KeyStatus> => {
    const map: Record<string, KeyStatus> = {};
    for (const guess of visibleGuesses) {
      const cells = evaluate(guess, answer);
      for (let i = 0; i < wordLen; i++) {
        const letter = guess[i];
        const cellStatus = cells[i].status as KeyStatus;
        const existing = map[letter];
        if (!existing || existing === "unused") map[letter] = cellStatus;
        else if (existing === "absent" && cellStatus !== "absent") map[letter] = cellStatus;
        else if (existing === "present" && cellStatus === "correct") map[letter] = cellStatus;
      }
    }
    for (const letter of hintedLetters) {
      if (!map[letter]) map[letter] = "absent";
    }
    return map;
  }, [visibleGuesses, answer, hintedLetters, wordLen]);

  // ----- Persist daily state -----
  useEffect(() => {
    if (mode !== "daily") return;
    localStorage.setItem(
      "palgrid-state",
      JSON.stringify({ date: todayDateStr, guesses: dailyGuesses, status: dailyStatus, hinted: [...hintedLetters] })
    );
  }, [dailyGuesses, dailyStatus, todayDateStr, mode, hintedLetters]);

  // ----- Countdown for next daily -----
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

  // ----- Input handling -----
  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing" || revealRow !== null) return;
      if (key === "ENTER") {
        if (current.length !== wordLen) {
          setToast({ text: t("palgrid.notEnoughLetters"), kind: "error" });
          setShake(true);
          vibrate(60);
          setTimeout(() => setShake(false), 500);
          return;
        }
        // 5-letter guesses validate against the dictionary; other lengths accept any complete word
        const isStandardWord = WORD_SET.has(current) || WORD_SET.has(current.toLowerCase());
        const isPalestineWord = PALESTINE_WORDS.some((w) => w.word.toUpperCase() === current);
        if (wordLen === 5 && !isStandardWord && !isPalestineWord) {
          setToast({ text: t("palgrid.notInWordList"), kind: "error" });
          setShake(true);
          vibrate(60);
          setTimeout(() => setShake(false), 500);
          return;
        }
        setToast(null);
        const newGuesses = [...guesses, current];
        const rowIndex = newGuesses.length - 1;
        setGuesses(newGuesses);
        setCurrent("");
        setRevealRow(rowIndex);

        const totalReveal = (wordLen - 1) * STAGGER_MS + FLIP_MS + 60;
        setTimeout(() => {
          setRevealRow(null);
          if (current === answer) {
            setStatus("won");
            setDance(true);
            playSuccessSound();
            vibrate([40, 60, 40, 60, 80]);
            recordResult(true, newGuesses.length);
            if (mode === "daily") setTimeout(() => setShowStats(true), 1600);
          } else if (newGuesses.length >= MAX_TRIES) {
            setStatus("lost");
            vibrate(180);
            recordResult(false, newGuesses.length);
            if (mode === "daily") setTimeout(() => setShowStats(true), 1400);
          }
        }, totalReveal);
        return;
      }
      if (key === "BACK") {
        if (current.length > 0) playTileSound(0.7, 0.85, 0.3);
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key) && current.length < wordLen) {
        vibrate(8);
        playTileSound();
        setCurrent((c) => c + key);
      }
    },
    [current, guesses, status, answer, setGuesses, setStatus, t, wordLen, revealRow, playTileSound, playSuccessSound, recordResult, mode]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const k = e.key.toUpperCase();
      if (k === "ENTER" || k === "BACKSPACE" || /^[A-Z]$/.test(k)) {
        e.preventDefault();
        const mapped = k === "BACKSPACE" ? "BACK" : k;
        flashKey(mapped);
        handleKey(mapped);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey, flashKey]);

  // Auto-clear toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Hint cooldown timer
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const timer = setInterval(() => setHintCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [hintCooldown]);

  // ----- Sharing -----
  const shareText = buildShareText(guesses, answer, status === "won", dailyIndex);
  const canShare = mode === "daily" && status !== "playing";

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setToast({ text: t("palgrid.copied"), kind: "success" });
    } catch {
      setToast({ text: t("palgrid.shareFailed"), kind: "error" });
    }
  };

  const shareToFeed = async () => {
    if (!user) {
      setToast({ text: t("palgrid.loginToShare"), kind: "error" });
      return;
    }
    setSharing(true);
    try {
      const { error: insertError } = await supabase.from("posts").insert({ user_id: user.id, text: shareText });
      if (insertError) throw insertError;
      setToast({ text: t("palgrid.sharedToFeed"), kind: "success" });
    } catch {
      setToast({ text: t("palgrid.shareFailed"), kind: "error" });
    } finally {
      setSharing(false);
    }
  };

  // ----- Cross-platform tie-ins -----
  const askGuide = () => {
    chatRef.current?.askQuestion(
      `Tell me more about "${targetData.word}" (${targetData.arabic}) in Palestinian history and culture.`
    );
  };

  const timelineMatch = useMemo(() => {
    if (status === "playing") return false;
    const needle = targetData.word.toLowerCase();
    return timelineData.some((y: { months: { events: { title?: string; description?: string; location?: string; tags?: string[] }[] }[] }) =>
      y.months.some((m) =>
        m.events.some((ev) =>
          [ev.title, ev.description, ev.location, ...(ev.tags || [])].filter(Boolean).join(" ").toLowerCase().includes(needle)
        )
      )
    );
  }, [status, targetData.word]);

  // ----- Render -----
  const grid = [...guesses, current.padEnd(wordLen, " ")];
  const winningRow = status === "won" ? guesses.length - 1 : -1;
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(1, ...stats.dist);
  const isDaily = mode === "daily";

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 pt-[80px] overflow-y-auto">
      <style>{`
        @keyframes pg-shake { 0%,100%{transform:translateX(0)} 15%,45%,75%{transform:translateX(-6px)} 30%,60%,90%{transform:translateX(6px)} }
        @keyframes pg-pop-kf { 0%{transform:scale(.7)} 60%{transform:scale(1.12)} 100%{transform:scale(1)} }
        @keyframes pg-dance-kf { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-45%)} 60%{transform:translateY(8%)} }
        .pg-shake { animation: pg-shake .45s ease-in-out; }
        .pg-pop { animation: pg-pop-kf .14s ease-out; }
        .pg-dance { animation: pg-dance-kf .65s cubic-bezier(.36,.07,.19,.97) both; }
        .pg-tile { perspective: 700px; }
        .pg-tile-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform ${FLIP_MS}ms cubic-bezier(.45,0,.25,1); }
        .pg-tile-inner.pg-flip { transform: rotateX(180deg); }
        .pg-face { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .pg-face-back { transform: rotateX(180deg); }
      `}</style>

      <div
        className={`relative rounded-[2.5rem] border bg-card/80 backdrop-blur-xl shadow-xl flex flex-col items-center gap-5 lg:gap-8 p-6 sm:p-8 w-full max-w-md lg:max-w-6xl my-auto transition-all duration-300 ${
          isDaily ? "border-primary/30 shadow-primary/10" : "border-violet-500/30 shadow-violet-500/10"
        }`}
      >
        {/* Toast */}
        {toast && (
          <div
            className={`absolute top-5 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 ${
              toast.kind === "error" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {toast.text}
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 items-center lg:items-start w-full gap-5">
          {/* Header + controls */}
          <div className="flex flex-col items-center gap-2 w-full order-1 lg:col-start-1 lg:row-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-widest text-foreground">{t("palgrid.title")}</h1>
              {isDaily && (
                <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[11px] font-bold text-primary tabular-nums">
                  #{dailyIndex}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm p-1">
              <button
                onPointerDown={(e) => { e.preventDefault(); goDaily(); }}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all duration-150 select-none touch-manipulation active:scale-95 ${
                  isDaily ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("palgrid.daily")}
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); startRandom(); }}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all duration-150 select-none touch-manipulation active:scale-95 ${
                  !isDaily ? "bg-violet-600 text-white shadow-md shadow-violet-600/25" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("palgrid.random")}
              </button>
              <div className="w-px h-4 bg-border" />
              {!isDaily && (
                <button
                  onPointerDown={(e) => { e.preventDefault(); resetRandom(); }}
                  title={t("palgrid.resetGame")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors active:scale-90"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onPointerDown={(e) => { e.preventDefault(); giveHint(); }}
                disabled={hintCooldown > 0}
                title={hintCooldown > 0 ? `${t("palgrid.hintAvailableIn")} ${hintCooldown}s` : t("palgrid.getHint")}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-90 ${
                  hintCooldown > 0 ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:text-amber-500 hover:bg-accent/15"
                }`}
              >
                {hintCooldown > 0 ? <span className="text-[10px] font-bold tabular-nums">{hintCooldown}</span> : <Lightbulb className="h-3.5 w-3.5" />}
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); toggleMute(); }}
                title={muted ? t("palgrid.soundOn") : t("palgrid.soundOff")}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors active:scale-90"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); setShowStats(true); }}
                title={t("palgrid.stats")}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors active:scale-90"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Keyboard / end panel */}
          <div className="flex flex-col items-center gap-1.5 w-full order-3 lg:col-start-1 lg:row-2 lg:gap-1">
            {status === "playing" ? (
              <div className="lg:mt-6 flex flex-col items-center gap-1.5 w-full">
                {KEYBOARD_ROWS.map((row, ri) => (
                  <div key={ri} className="flex gap-1 justify-center">
                    {row.map((key) => {
                      const isWide = key === "ENTER" || key === "BACK";
                      const kStatus = keyStatuses[key] || "unused";
                      const sizeCls = isWide
                        ? "px-2 sm:px-3 lg:px-4 text-[10px] sm:text-xs lg:text-sm min-w-[44px] sm:min-w-[52px] lg:min-w-[60px]"
                        : "w-8 sm:w-10 lg:w-12 text-sm sm:text-base lg:text-lg";
                      const isPressed = pressedKey === key;
                      return (
                        <button
                          key={key}
                          onPointerDown={(e) => { e.preventDefault(); handleKey(key); }}
                          className={`select-none touch-manipulation ${sizeCls} h-12 sm:h-14 lg:h-16 rounded-lg border-2 font-bold uppercase transition-all duration-100 cursor-pointer active:scale-90 active:brightness-110 ${KEY_STATUS_COLORS[kStatus]} ${
                            isPressed ? "scale-90 brightness-110 ring-2 ring-primary/60" : ""
                          }`}
                        >
                          {key === "BACK" ? <Delete className="w-4 h-4 mx-auto rtl:-scale-x-100" /> : key}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in slide-in-from-bottom-4 w-full lg:max-w-sm">
                <div
                  className={`text-xl font-bold px-6 py-3 rounded-2xl border w-full text-center shadow-lg ${
                    status === "won"
                      ? "bg-primary/15 border-primary/30 text-foreground"
                      : "bg-destructive/15 border-destructive/30 text-foreground"
                  }`}
                >
                  {status === "won" ? t("palgrid.wellDone") : `${t("palgrid.wordWas")} ${answer}`}
                </div>

                {/* Word info — the educational payoff */}
                <div className="rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm p-5 w-full text-start shadow-inner">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/15 text-primary px-2 py-1 rounded-md">
                      {targetData.category}
                    </span>
                    <span className="text-2xl font-bold text-muted-foreground">{targetData.arabic}</span>
                  </div>
                  <h3 className="text-primary font-bold text-xl mb-2 tracking-wide">{targetData.word}</h3>
                  <p className="text-sm text-foreground mb-3">
                    <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wider block mb-1">{t("palgrid.meaning")}</span>
                    {targetData.meaning}
                  </p>
                  <div className="border-s-2 border-primary/60 ps-3">
                    <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wider block mb-1">{t("palgrid.context")}</span>
                    <p className="text-sm italic leading-relaxed text-muted-foreground">{targetData.context}</p>
                  </div>

                  {/* Dig deeper: AI guide + timeline */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={askGuide}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {t("palgrid.askGuide")}
                    </button>
                    {timelineMatch && (
                      <Link
                        to="/timeline"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                      >
                        <Map className="h-3.5 w-3.5" />
                        {t("palgrid.viewTimeline")}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Share row (daily only) */}
                {canShare && (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={copyResult}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card/70 px-3 py-2.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {t("palgrid.copyResult")}
                    </button>
                    <button
                      onClick={shareToFeed}
                      disabled={sharing}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {t("palgrid.shareToFeed")}
                    </button>
                  </div>
                )}

                {isDaily ? (
                  <div className="text-center mt-1">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">{t("palgrid.nextPuzzleIn")}</p>
                    <p className="text-3xl font-mono text-foreground tabular-nums">{formatTime(timeLeft)}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 mt-1 w-full">
                    <button
                      onPointerDown={(e) => { e.preventDefault(); startRandom(); }}
                      className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-widest text-sm transition-all duration-150 select-none touch-manipulation active:scale-95 shadow-lg shadow-violet-600/25"
                    >
                      {t("palgrid.newRandomWord")}
                    </button>
                    <button
                      onPointerDown={(e) => { e.preventDefault(); goDaily(); }}
                      className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest font-bold transition-colors select-none touch-manipulation"
                    >
                      {t("palgrid.backToDaily")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="flex flex-col flex-1 items-center justify-center order-1 lg:row-1 lg:row-span-2 lg:col-start-2 lg:ps-8 lg:border-s lg:border-border/50 lg:w-full">
            <div className="flex flex-col gap-2 lg:gap-2.5">
              {Array.from({ length: MAX_TRIES }).map((_, i) => {
                const evaluated = guesses[i] ? evaluate(guesses[i], answer) : null;
                const isCurrent = i === guesses.length && status === "playing";
                const isRevealing = i === revealRow;
                return (
                  <div key={i} className={`flex gap-2 lg:gap-2.5 ${isCurrent && shake ? "pg-shake" : ""}`}>
                    {Array.from({ length: wordLen }).map((_, j) => {
                      if (isRevealing && evaluated) {
                        return (
                          <FlipCell
                            key={`${i}-${j}-flip`}
                            letter={evaluated[j].letter}
                            status={evaluated[j].status}
                            delay={j * STAGGER_MS}
                            sizeClass={sizeClass}
                          />
                        );
                      }
                      const cell = evaluated?.[j] || { letter: grid[i]?.[j] || "", status: "" as const };
                      return (
                        <StaticCell
                          key={`${i}-${j}-${cell.letter}`}
                          cell={cell}
                          isCurrent={isCurrent}
                          sizeClass={sizeClass}
                          dance={dance && i === winningRow}
                          danceDelay={j * 90}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center font-medium">
          {status === "playing" ? t("palgrid.playingHelp") : isDaily ? t("palgrid.dailyResetHelp") : t("palgrid.practiceHelp")}
        </div>
      </div>

      {/* Stats modal */}
      {showStats && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowStats(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-6 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold tracking-tight text-foreground">{t("palgrid.stats")}</h2>
              <button
                onClick={() => setShowStats(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { value: stats.played, label: t("palgrid.played") },
                { value: `${winRate}%`, label: t("palgrid.winRate") },
                { value: stats.streak, label: t("palgrid.streak") },
                { value: stats.maxStreak, label: t("palgrid.maxStreak") },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center rounded-xl bg-background/50 border border-border/50 py-3">
                  <span className="text-2xl font-bold tabular-nums text-foreground">{item.value}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5 px-1">{item.label}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{t("palgrid.distribution")}</h3>
            <div className="flex flex-col gap-1.5 mb-6">
              {stats.dist.map((count, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 text-xs font-bold tabular-nums text-muted-foreground">{idx + 1}</span>
                  <div className="flex-1 h-5 rounded-md bg-background/50 overflow-hidden">
                    <div
                      className="h-full rounded-md bg-primary flex items-center justify-end px-1.5 transition-all duration-500"
                      style={{ width: count > 0 ? `${Math.max(10, (count / maxDist) * 100)}%` : "0%" }}
                    >
                      {count > 0 && <span className="text-[10px] font-bold text-primary-foreground tabular-nums">{count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {canShare && (
              <div className="flex gap-2">
                <button
                  onClick={copyResult}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t("palgrid.copyResult")}
                </button>
                <button
                  onClick={shareToFeed}
                  disabled={sharing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {t("palgrid.shareToFeed")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI guide — lets players dig into the word they just learned */}
      <ChatBot ref={chatRef} />
    </div>
  );
}
