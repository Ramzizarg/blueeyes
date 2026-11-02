"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { slides } from "@/lib/slides";

type ImmersiveStoryProps = {
  onContact?: () => void;
};

export function ImmersiveStory({ onContact }: ImmersiveStoryProps) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Preload every slide image once so swaps never flash empty
  useEffect(() => {
    for (const slide of slides) {
      const desktop = new window.Image();
      desktop.src = slide.image;
      const mobile = new window.Image();
      mobile.src = slide.mobileImage;
    }
  }, []);

  useEffect(() => {
    const panels = slides
      .map((slide) => document.getElementById(`slide-${slide.id}`))
      .filter(Boolean) as HTMLElement[];

    if (panels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target) return;
        const next = panels.findIndex((panel) => panel === visible.target);
        if (next >= 0) setIndex(next);
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    for (const panel of panels) observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((next: number) => {
    if (next >= slides.length) {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    document
      .getElementById(`slide-${slides[clamped].id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div id="top" className="relative" aria-label="BLUEEYES story">
      {slides.map((slide, i) => (
        <section
          key={slide.id}
          id={`slide-${slide.id}`}
          className="story-panel relative flex h-[100dvh] w-full flex-col justify-end overflow-hidden"
          aria-label={`Slide ${i + 1} of ${slides.length}`}
        >
          <div className="absolute inset-0">
            <picture>
              <source media="(min-width: 768px)" srcSet={slide.image} />
              <img
                src={slide.mobileImage}
                alt={slide.imageAlt}
                width={isMobile ? 1440 : 2560}
                height={isMobile ? 2560 : 1440}
                decoding={i === 0 ? "sync" : "async"}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                draggable={false}
                className={`story-photo absolute inset-0 h-full w-full select-none object-cover object-center ${
                  reduceMotion ? "" : "story-photo-motion"
                }`}
              />
            </picture>
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 pt-28 sm:px-8 sm:pb-28 lg:px-10 lg:pb-32">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="hero-copy max-w-4xl">
                <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/90">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </p>
                <h1
                  className={`display whitespace-pre-line text-white ${
                    i === 0
                      ? "text-[clamp(3.2rem,12vw,9rem)]"
                      : "text-[clamp(2.4rem,9vw,7.4rem)]"
                  }`}
                >
                  {i === 0 ? (
                    <>
                      blueeyes
                      <span className="text-signal-soft">.</span>
                    </>
                  ) : (
                    slide.title
                  )}
                </h1>
              </div>

              <div className="hero-copy flex max-w-md flex-col items-start gap-6 text-left lg:pb-3">
                <p className="panel-copy text-[1.02rem] leading-relaxed text-white sm:text-[1.1rem]">
                  {slide.subtitle}
                </p>
                {slide.cta ? (
                  <button
                    type="button"
                    className="cta-pill"
                    onClick={() => {
                      if (i === slides.length - 1) onContact?.();
                      else goTo(i + 1);
                    }}
                  >
                    {slide.cta}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ))}

      <StoryChrome
        index={index}
        isMobile={isMobile}
        reduceMotion={!!reduceMotion}
        onGoTo={goTo}
      />
    </div>
  );
}

function StoryChrome({
  index,
  isMobile,
  reduceMotion,
  onGoTo,
}: {
  index: number;
  isMobile: boolean;
  reduceMotion: boolean;
  onGoTo: (next: number) => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const update = () => {
      const contact = document.getElementById("contact");
      if (!contact) return;
      setVisible(contact.getBoundingClientRect().top > window.innerHeight * 0.55);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 right-3 z-30 flex flex-col items-center justify-center gap-3 sm:right-7">
        <div className="pointer-events-auto flex flex-col items-center gap-3 sm:gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className="nav-dot touch-manipulation"
              data-active={i === index}
              onClick={() => onGoTo(i)}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-white/80 sm:bottom-6 sm:flex-row sm:gap-3 sm:text-[0.68rem] sm:tracking-[0.2em]">
        <span className="hero-copy">
          {index >= slides.length - 1
            ? "Keep scrolling"
            : isMobile
              ? "Swipe"
              : "Scroll"}
        </span>
        <motion.span
          aria-hidden
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block h-7 w-px bg-white/65 sm:h-8"
        />
      </div>
    </>
  );
}
