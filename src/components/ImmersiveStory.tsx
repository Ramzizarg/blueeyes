"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { animateScrollTo, scrollToTarget } from "@/components/SmoothScroll";
import { slides } from "@/lib/slides";

type ImmersiveStoryProps = {
  onContact?: () => void;
};

const origins = ["c", "tr", "bl", "br", "tl"] as const;

const introEase = [0.22, 1, 0.36, 1] as const;

function isTouchScrollDevice() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  const ua = navigator.userAgent || "";
  const inApp =
    /Instagram|FBAN|FBAV|Line\/|Twitter|TikTok|Snapchat|MicroMessenger/i.test(
      ua,
    );
  return coarse || noHover || narrow || inApp;
}

export function ImmersiveStory({ onContact }: ImmersiveStoryProps) {
  const [index, setIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchScroll, setTouchScroll] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const reduceMotion = useReducedMotion();
  const deckRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const touchScrollRef = useRef(touchScroll);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    touchScrollRef.current = touchScroll;
  }, [touchScroll]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    setTouchScroll(isTouchScrollDevice());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setIntroDone(true);
      return;
    }
    const timer = window.setTimeout(() => setIntroDone(true), 1600);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  useEffect(() => {
    const start = Math.max(0, index - 1);
    const end = Math.min(slides.length - 1, index + 1);
    for (let i = start; i <= end; i += 1) {
      const slide = slides[i];
      const webp = new window.Image();
      webp.src = isMobile ? slide.mobileImageWebp : slide.imageWebp;
      const jpg = new window.Image();
      jpg.src = isMobile ? slide.mobileImage : slide.image;
    }
  }, [index, isMobile]);

  // Desktop: the page itself scrolls, so the active slide follows scroll position.
  useEffect(() => {
    if (touchScroll) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const first = document.getElementById(`slide-${slides[0].id}`);
      if (!first) return;
      const panelH = first.offsetHeight || window.innerHeight;
      const next = Math.round(window.scrollY / panelH);
      setIndex(Math.max(0, Math.min(slides.length - 1, next)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [touchScroll]);

  // Mobile: swipe between photos at the top. On the last photo, the same
  // upward drag pulls contact up with the finger, then eases into place.
  useEffect(() => {
    if (!touchScroll) return;
    const deck = deckRef.current;
    if (!deck) return;

    const pointer = {
      y: 0,
      t: 0,
      dy: 0,
      active: false,
      pullingContact: false,
    };
    let parked = true;
    let scrollFrame = 0;
    let animating = false;

    const contactTop = () => {
      const contact = document.getElementById("contact");
      return contact
        ? contact.getBoundingClientRect().top + window.scrollY
        : window.innerHeight;
    };

    const setDeckMode = (on: boolean) => {
      parked = on;
      deck.dataset.deck = on ? "on" : "off";
    };

    const syncFromScroll = () => {
      scrollFrame = 0;
      if (animating || pointer.active) return;
      const y = window.scrollY;
      if (y <= 8) {
        if (!parked) setIndex(slides.length - 1);
        setDeckMode(true);
        return;
      }
      setDeckMode(false);
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(syncFromScroll);
    };

    const onStart = (event: TouchEvent) => {
      if (animating) return;
      if (window.scrollY > 8) {
        setDeckMode(false);
        return;
      }
      const touch = event.touches[0];
      if (!touch) return;
      setDeckMode(true);
      pointer.y = touch.clientY;
      pointer.t = performance.now();
      pointer.dy = 0;
      pointer.active = true;
      pointer.pullingContact = false;
      setDragging(true);
    };

    const onMove = (event: TouchEvent) => {
      if (!pointer.active || !parked) return;
      const touch = event.touches[0];
      if (!touch) return;
      const raw = touch.clientY - pointer.y;
      pointer.dy = raw;

      const onLast = indexRef.current === slides.length - 1;
      const atStart = indexRef.current === 0 && raw > 0;

      // Last photo → contact: page follows the finger 1:1.
      if (onLast && (raw < 0 || pointer.pullingContact)) {
        pointer.pullingContact = true;
        if (event.cancelable) event.preventDefault();
        setDragY(0);
        window.scrollTo({ top: Math.max(0, Math.min(-raw, contactTop())) });
        return;
      }

      if (event.cancelable) event.preventDefault();
      setDragY(atStart ? raw * 0.28 : raw);
    };

    const onEnd = () => {
      if (!pointer.active) return;
      pointer.active = false;
      setDragging(false);
      setDragY(0);

      const height = deck.clientHeight || window.innerHeight;
      const elapsed = Math.max(1, performance.now() - pointer.t);
      const velocity = pointer.dy / elapsed;

      // Finish or cancel the pull into contact.
      if (pointer.pullingContact) {
        pointer.pullingContact = false;
        const y = window.scrollY;
        const target = contactTop();
        const commit =
          y > height * 0.18 || (pointer.dy < 0 && Math.abs(velocity) > 0.35);
        animating = true;
        setDeckMode(false);
        animateScrollTo(commit ? target : 0, commit ? 460 : 380, () => {
          animating = false;
          if (!commit) {
            setDeckMode(true);
            setIndex(slides.length - 1);
          }
        });
        return;
      }

      if (!parked) return;

      const passed =
        Math.abs(pointer.dy) > height * 0.14 || Math.abs(velocity) > 0.4;
      if (!passed) return;

      const forward = pointer.dy < 0;
      const next = indexRef.current + (forward ? 1 : -1);
      if (next >= slides.length) {
        // Flick from last photo without much drag distance.
        animating = true;
        setDeckMode(false);
        animateScrollTo(contactTop(), 460, () => {
          animating = false;
        });
        return;
      }
      if (next < 0) return;
      setIndex(next);
    };

    setDeckMode(window.scrollY <= 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    deck.addEventListener("touchstart", onStart, { passive: true });
    deck.addEventListener("touchmove", onMove, { passive: false });
    deck.addEventListener("touchend", onEnd);
    deck.addEventListener("touchcancel", onEnd);
    return () => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", onScroll);
      deck.removeEventListener("touchstart", onStart);
      deck.removeEventListener("touchmove", onMove);
      deck.removeEventListener("touchend", onEnd);
      deck.removeEventListener("touchcancel", onEnd);
      delete deck.dataset.deck;
    };
  }, [touchScroll]);

  const goTo = useCallback(
    (next: number) => {
      if (next >= slides.length) {
        scrollToTarget("#contact", { duration: 1.2 });
        return;
      }
      const clamped = Math.max(0, Math.min(slides.length - 1, next));
      if (touchScrollRef.current) {
        window.scrollTo({ top: 0 });
        setIndex(clamped);
        return;
      }
      const first = document.getElementById(`slide-${slides[0].id}`);
      const panelH = first?.offsetHeight || window.innerHeight;
      scrollToTarget(clamped * panelH, { duration: 1.15 });
    },
    [],
  );

  return (
    <div
      id="top"
      ref={deckRef}
      className="story-deck relative"
      aria-label="BLUEEYES story"
    >
      <div
        className="story-track"
        style={
          touchScroll
            ? {
                transform: `translate3d(0, calc(${-index} * 100dvh + ${dragY}px), 0)`,
                transition: dragging
                  ? "none"
                  : reduceMotion
                    ? "transform 0.01s linear"
                    : "transform 0.62s cubic-bezier(0.22, 1, 0.36, 1)",
              }
            : undefined
        }
      >
      {slides.map((slide, i) => {
        const active = i === index;
        const isHero = i === 0;
        const motionOn =
          !reduceMotion &&
          introDone &&
          (touchScroll ? active : Math.abs(i - index) <= 1);

        return (
          <section
            key={slide.id}
            id={`slide-${slide.id}`}
            className={`story-panel relative flex h-[100lvh] w-full flex-col justify-end overflow-hidden ${
              isHero ? "story-panel-intro" : ""
            }`}
            aria-label={`Slide ${i + 1} of ${slides.length}`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-[-6%]"
                initial={
                  reduceMotion
                    ? false
                    : isHero
                      ? { opacity: 0, y: "10%", scale: 1.14 }
                      : { opacity: 0.72, scale: 1.08 }
                }
                animate={
                  active || isHero
                    ? { opacity: 1, y: "0%", scale: 1 }
                    : { opacity: 0.85, scale: 1.04 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : isHero
                      ? {
                          duration: 1.7,
                          ease: introEase,
                          opacity: { duration: 1.15, ease: "easeOut" },
                        }
                      : {
                          duration: 0.85,
                          ease: introEase,
                        }
                }
              >
                <picture className="absolute inset-0 block h-full w-full">
                  <source
                    media="(min-width: 768px)"
                    type="image/webp"
                    srcSet={slide.imageWebp}
                  />
                  <source media="(min-width: 768px)" srcSet={slide.image} />
                  <source type="image/webp" srcSet={slide.mobileImageWebp} />
                  <img
                    src={slide.mobileImage}
                    alt={slide.imageAlt}
                    width={isMobile ? 1600 : 3200}
                    height={isMobile ? 2844 : 1800}
                    decoding={i === 0 ? "sync" : "async"}
                    loading="eager"
                    fetchPriority={i === 0 ? "high" : "low"}
                    draggable={false}
                    data-origin={origins[i % origins.length]}
                    data-active={active ? "true" : "false"}
                    className={`story-photo absolute inset-0 h-full w-full select-none object-cover object-center ${
                      motionOn ? "story-photo-motion" : ""
                    }`}
                  />
                </picture>
                <div
                  className="story-veil"
                  data-active={motionOn ? "true" : "false"}
                  aria-hidden
                />
              </motion.div>
            </div>

            <motion.div
              className="relative z-10 flex h-full flex-col justify-end px-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-28 sm:px-8 sm:pb-28 lg:px-10 lg:pb-32"
              initial={
                isHero && !reduceMotion
                  ? { opacity: 0, y: 28 }
                  : false
              }
              animate={{ opacity: 1, y: 0 }}
              transition={
                isHero && !reduceMotion
                  ? { duration: 1, ease: introEase, delay: 0.55 }
                  : { duration: 0 }
              }
            >
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
                        // Hero + final CTAs jump to contact ("From idea to launch.")
                        if (i === 0 || i === slides.length - 1) onContact?.();
                        else goTo(i + 1);
                      }}
                    >
                      {slide.cta}
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </section>
        );
      })}
      </div>

      <StoryChrome
        index={index}
        isMobile={isMobile}
        reduceMotion={!!reduceMotion}
        ready={introDone}
        onGoTo={goTo}
      />
    </div>
  );
}

function StoryChrome({
  index,
  isMobile,
  reduceMotion,
  ready,
  onGoTo,
}: {
  index: number;
  isMobile: boolean;
  reduceMotion: boolean;
  ready: boolean;
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

  if (!visible || !ready) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: introEase }}
    >
      <div className="pointer-events-none fixed inset-y-0 right-3 z-30 flex flex-col items-center justify-center gap-3 sm:right-7">
        <div className="pointer-events-auto flex flex-col items-center gap-2.5">
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
    </motion.div>
  );
}
