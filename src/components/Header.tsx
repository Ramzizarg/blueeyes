"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type HeaderProps = {
  onContact?: () => void;
};

export function Header({ onContact }: HeaderProps) {
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    const update = () => {
      const contact = document.getElementById("contact");
      setOnLight(!!contact && contact.getBoundingClientRect().top <= 40);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const tone = onLight ? "text-ink" : "hero-copy text-frost";

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a
          href="#top"
          className={`pointer-events-auto display text-[1.15rem] tracking-[-0.06em] transition-colors duration-300 sm:text-[1.35rem] ${tone}`}
          aria-label="BLUEEYES home"
        >
          blueeyes<span className="text-signal-soft">.</span>
        </a>

        <div className="pointer-events-auto flex items-center gap-3">
          <a
            href="mailto:hello@blueeyes.work"
            className={`hidden text-[0.72rem] font-medium uppercase tracking-[0.16em] opacity-85 transition hover:opacity-100 sm:inline ${tone}`}
          >
            hello@blueeyes.work
          </a>
          <button
            type="button"
            onClick={onContact}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${onLight ? "border-ink/20 text-ink hover:bg-ink/5" : "border-frost/30 text-frost hover:border-frost hover:bg-frost/10"}`}
            aria-label="Contact on WhatsApp"
          >
            <WhatsAppIcon />
          </button>
        </div>
      </div>
    </motion.header>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12.04 2C6.58 2 2.15 6.37 2.15 11.75c0 1.9.52 3.75 1.5 5.38L2 22l5.05-1.58a10.1 10.1 0 0 0 4.99 1.28h.01c5.46 0 9.89-4.37 9.89-9.75S17.51 2 12.04 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.2 8.55c-.2-.45-.41-.46-.6-.47h-.51c-.18 0-.47.07-.72.35s-.94.91-.94 2.22.96 2.58 1.1 2.76c.13.18 1.86 2.97 4.6 4.05 2.28.9 2.74.72 3.24.68.5-.05 1.61-.65 1.84-1.28.23-.63.23-1.17.16-1.28-.07-.11-.26-.18-.55-.32-.28-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.28-.7.88-.86 1.06-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.73-1.39-1.63-1.55-1.91-.16-.28-.02-.43.12-.57.13-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.48-.07-.14-.61-1.5-.84-2.05Z"
        fill="currentColor"
      />
    </svg>
  );
}
