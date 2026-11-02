"use client";

import Image from "next/image";
import { useState } from "react";
import { ProjectForm } from "@/components/ProjectForm";
import { Reveal } from "@/components/Reveal";
import { EMAIL, hasWhatsapp, whatsappUrl } from "@/lib/contact";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-16 overflow-hidden bg-[#f6f1f6] px-5 py-14 text-ink sm:px-8 sm:py-16 lg:px-10"
    >
      <div className="absolute inset-0">
        <Image
          src="/slides/hero-03.jpg"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbf3f8]/90 via-[#f3eefa]/80 to-[#eaf0fd]/90" />
      </div>

      <div className="relative mx-auto grid max-w-[1000px] items-center gap-10 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-14">
        <Reveal>
          <p className="eyebrow mb-4">
            <span className="eyebrow-dot" aria-hidden />
            Contact
          </p>
          <h2 className="display mb-4 text-[clamp(1.8rem,3.4vw,3rem)] text-ink">
            Let&apos;s make your brand unforgettable
            <span className="text-signal">.</span>
          </h2>
          <p className="panel-copy mb-7 max-w-sm text-[0.88rem] leading-relaxed text-ink/60">
            Tell me about your project — I reply within 24 hours.
          </p>

          <div className="flex flex-col gap-1 border-t border-ink/10 pt-4">
            <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink/45">
              Prefer email?
            </span>
            <CopyEmail />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mb-3 flex justify-center lg:justify-start">
            <span className="status-pill">
              <span className="status-dot" aria-hidden />
              Available for new projects
            </span>
          </div>

          <div className="form-card">
            <h3 className="display mb-1.5 text-[1.3rem] tracking-[-0.03em] text-[#1c2230]">
              From idea to launch.
            </h3>
            <p className="mb-5 text-[0.9rem] leading-relaxed text-[#1c2230]/80">
              Tell me about your project and I&apos;ll get back within 24 hours.
            </p>

            {hasWhatsapp ? (
              <>
                <a
                  href={whatsappUrl("Hi blueeyes! I'd like to talk about a website project.")}
                  target="_blank"
                  rel="noreferrer"
                  className="wa-card group"
                >
                  <span className="wa-icon" aria-hidden>
                    <WhatsAppIcon />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[0.82rem] font-semibold text-[#1a9e4b]">
                      Start a WhatsApp conversation
                    </span>
                    <span className="block text-[0.78rem] text-[#1c2230]/70">
                      Faster answer — I&apos;m usually online
                    </span>
                  </span>
                  <span className="text-ink/35 transition group-hover:translate-x-1 group-hover:text-ink" aria-hidden>
                    →
                  </span>
                </a>

                <div className="my-5 flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#1c2230]/55">
                  <span className="h-px flex-1 bg-[#1c2230]/15" />
                  or fill the form
                  <span className="h-px flex-1 bg-[#1c2230]/15" />
                </div>
              </>
            ) : null}

            <ProjectForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <a
        href={`mailto:${EMAIL}`}
        className="display text-[1.1rem] tracking-[-0.03em] text-ink transition hover:text-signal"
      >
        {EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-ink/15 px-2.5 py-0.5 text-[0.65rem] text-ink/60 transition hover:border-ink/40 hover:text-ink"
      >
        <span aria-live="polite">{copied ? "Copied ✓" : "Copy"}</span>
      </button>
    </div>
  );
}

export function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.37 2.15 11.75c0 1.9.52 3.75 1.5 5.38L2 22l5.05-1.58a10.1 10.1 0 0 0 4.99 1.28h.01c5.46 0 9.89-4.37 9.89-9.75S17.51 2 12.04 2Zm5.03 13.62c-.23.63-1.34 1.23-1.84 1.28-.5.04-.96.22-3.24-.68-2.74-1.08-4.47-3.87-4.6-4.05-.14-.18-1.1-1.45-1.1-2.76s.69-1.94.94-2.22c.25-.28.54-.35.72-.35h.51c.19.01.4.02.6.47.23.55.77 1.91.84 2.05.07.13.11.3.02.48-.1.18-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.18 1.55 1.91 1.07.94 1.97 1.23 2.25 1.37.28.13.44.11.6-.07.16-.18.68-.78.86-1.06.18-.28.36-.23.61-.14.25.09 1.58.74 1.86.88.29.14.48.21.55.32.07.11.07.65-.16 1.28Z" />
    </svg>
  );
}
