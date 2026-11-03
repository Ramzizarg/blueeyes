"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type WelcomeGateProps = {
  onComplete: () => void;
};

type Option = {
  label: string;
  hint: string;
};

type Question = {
  prompt: string;
  note: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    prompt: "Do you like projects that feel cinematic?",
    note: "If yes — you’re in the right place.",
    options: [
      { label: "Yes, that’s my taste", hint: "I want work that stands out" },
      { label: "Show me first", hint: "I need to see the standard" },
    ],
  },
  {
    prompt: "Want a pro website with the best design possible?",
    note: "Clean craft. Strong UX. Nothing average.",
    options: [
      { label: "Absolutely", hint: "Premium is non‑negotiable" },
      { label: "That’s the brief", hint: "Make it feel inevitable" },
    ],
  },
  {
    prompt: "Ready to open blueeyes?",
    note: "I’ll take you into the full experience.",
    options: [
      { label: "Open the site", hint: "Start the experience" },
      { label: "Let’s begin", hint: "Show the best UX / UI" },
    ],
  },
];

const STORAGE_KEY = "blueeyes-welcome-seen-v4";

export function shouldShowWelcomeGate() {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function useTypewriter(text: string, enabled: boolean, cps = 58) {
  const [value, setValue] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setValue(text);
      setDone(true);
      return;
    }

    setValue("");
    setDone(false);
    let i = 0;
    let timer = 0;

    const tick = () => {
      i += 1;
      setValue(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      const ch = text[i - 1];
      const pause = /[,.?]/.test(ch) ? 55 : /\s/.test(ch) ? 12 : 1000 / cps;
      timer = window.setTimeout(tick, pause);
    };

    timer = window.setTimeout(tick, 90);
    return () => window.clearTimeout(timer);
  }, [cps, enabled, text]);

  const skip = useCallback(() => {
    setValue(text);
    setDone(true);
  }, [text]);

  return { value, done, skip };
}

export function WelcomeGate({ onComplete }: WelcomeGateProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const question = QUESTIONS[step];
  const isLast = step >= QUESTIONS.length - 1;
  const progress = ((step + (showOptions ? 1 : 0.45)) / QUESTIONS.length) * 100;

  const promptType = useTypewriter(question.prompt, !reduceMotion, 60);
  const noteType = useTypewriter(
    question.note,
    !reduceMotion && promptType.done,
    64,
  );

  useEffect(() => {
    setShowOptions(false);
    setSelected(0);
  }, [step]);

  useEffect(() => {
    if (!promptType.done || !noteType.done) return;
    const t = window.setTimeout(
      () => setShowOptions(true),
      reduceMotion ? 0 : 120,
    );
    return () => window.clearTimeout(t);
  }, [noteType.done, promptType.done, reduceMotion, step]);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setLeaving(true);
    window.setTimeout(() => onComplete(), reduceMotion ? 100 : 550);
  }, [onComplete, reduceMotion]);

  const confirm = useCallback(() => {
    if (!showOptions || leaving) return;
    if (isLast) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }, [finish, isLast, leaving, showOptions]);

  const skipTyping = useCallback(() => {
    promptType.skip();
    noteType.skip();
    setShowOptions(true);
  }, [noteType, promptType]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (leaving) return;

      if (!showOptions) {
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          skipTyping();
        }
        return;
      }

      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        setSelected((i) => Math.min(question.options.length - 1, i + 1));
      } else if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        setSelected((i) => Math.max(0, i - 1));
      } else if (event.key === "1") {
        setSelected(0);
      } else if (event.key === "2") {
        setSelected(Math.min(1, question.options.length - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        confirm();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm, leaving, question.options.length, showOptions, skipTyping]);

  return (
    <motion.div
      className="welcome-gate"
      initial={false}
      animate={leaving ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome questions"
      onClick={() => {
        if (!showOptions) skipTyping();
      }}
    >
      <div className="welcome-gate-orb welcome-gate-orb-a" aria-hidden />
      <div className="welcome-gate-orb welcome-gate-orb-b" aria-hidden />

      <div className="welcome-gate-inner">
        <div className="welcome-gate-top">
          <div className="welcome-gate-brand" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={497} height={220} className="h-6 w-auto" draggable={false} />
          </div>
          <p className="welcome-gate-step">
            {step + 1}/{QUESTIONS.length}
          </p>
        </div>

        <div className="welcome-gate-track" aria-hidden>
          <span style={{ width: `${Math.min(100, progress)}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.prompt}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="welcome-chat"
          >
            <div className="welcome-chat-row">
              <div className="welcome-chat-avatar" aria-hidden>
                b
              </div>
              <div className="welcome-chat-bubble">
                <h1 className="welcome-gate-prompt" aria-live="polite">
                  {promptType.value}
                  {!promptType.done ? (
                    <span className="welcome-caret" aria-hidden />
                  ) : null}
                </h1>
                {(noteType.value || promptType.done) && (
                  <p className="welcome-gate-note" aria-live="polite">
                    {noteType.value}
                    {promptType.done && !noteType.done ? (
                      <span className="welcome-caret" aria-hidden />
                    ) : null}
                  </p>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showOptions ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="welcome-gate-options"
                  role="listbox"
                  aria-label="Answers"
                  onClick={(e) => e.stopPropagation()}
                >
                  {question.options.map((option, i) => {
                    const active = selected === i;
                    return (
                      <motion.button
                        key={option.label}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className="welcome-gate-option"
                        data-active={active}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.24,
                          delay: reduceMotion ? 0 : i * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onMouseEnter={() => setSelected(i)}
                        onFocus={() => setSelected(i)}
                        onClick={() => {
                          setSelected(i);
                          window.setTimeout(confirm, 30);
                        }}
                      >
                        <span className="welcome-gate-option-index">
                          {active ? "›" : ""}
                          {i + 1}
                        </span>
                        <span className="welcome-gate-option-copy">
                          <span className="welcome-gate-option-label">
                            {option.label}
                          </span>
                          <span className="welcome-gate-option-hint">
                            {option.hint}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <p className="welcome-skip-hint">Tap or Enter to skip</p>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
