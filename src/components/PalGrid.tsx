import { useEffect, useState } from "react";
import { WORDS } from "../data/words";
import Navbar from "./Navbar";

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

  const evaluate = (guess: string): Cell[] => {
    const res: Cell[] = Array.from({ length: WORD_LENGTH }, (_, i) => ({
      letter: guess[i] || "",
      status: "",
    }));

    const answerArr = answer.split("");
    const used = Array(WORD_LENGTH).fill(false);

    // correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === answerArr[i]) {
        res[i].status = "correct";
        used[i] = true;
      }
    }

    // present letters
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

        if (current === answer) {
          setStatus("won");
        } else if (newGuesses.length >= MAX_TRIES) {
          setStatus("lost");
        }
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
   
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
        
        
        <h1 className="text-4xl font-bold tracking-widest">PALGRID</h1>

        {error && (
          <div className="text-sm bg-white text-black px-3 py-1 rounded">
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

                  let bg = "bg-white/10 border border-white/30";

                  if (evaluated) {
                    if (evaluated[j].status === "correct")
                      bg = "bg-green-600 border-green-700";
                    else if (evaluated[j].status === "present")
                      bg = "bg-yellow-500 border-yellow-600";
                    else
                      bg = "bg-zinc-700 border-zinc-800";
                  }

                  return (
                    <div
                      key={j}
                      className={`w-14 h-14 flex items-center justify-center text-2xl font-bold uppercase rounded-md ${bg}`}
                    >
                      {letter.trim()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="text-sm text-white/70 mt-6 max-w-md text-center leading-relaxed bg-black/30 px-4 py-3 rounded">
          <h2 className="text-white font-bold mb-2">How to Play</h2>
          <p>
            Guess the 5-letter word in 6 tries. Type letters using your keyboard and press Enter to submit.
            Green means the letter is correct and in the right position, yellow means the letter exists in the word
            but in a different position, and gray means the letter is not in the word.
          </p>
        </div>

        {status !== "playing" && (
          <div className="text-xl mt-4 bg-black/60 px-4 py-2 rounded">
            {status === "won" ? "You Won 🎉" : `You Lost 💀 Answer: ${answer}`}
          </div>
        )}

        <p className="text-sm text-white/70 mt-2">
          Type with keyboard. Enter to submit.
        </p>
        
      </div>
   
  );
}
