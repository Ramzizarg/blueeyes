"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { slides } from "@/lib/slides";

type ImmersiveStoryProps = {
  onContact?: () => void;
};

export function ImmersiveStory({ onContact }: ImmersiveStoryProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const transitioning = useRef(false);
  const reduceMotion = useReducedMotion();
  const active = slides[index];

  const rawX = useSpring(0, { stiffness: 50, damping: 24, mass: 0.4 });
  const rawY = useSpring(0, { stiffness: 50, damping: 24, mass: 0.4 });

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (transitioning.current) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, next));

      if (clamped === index) return;

      transitioning.current = true;
      setDirection(dir);
      setIndex(clamped);
      window.setTimeout(
        () => {
          transitioning.current = false;
        },
        reduceMotion ? 120 : 980,
      );
    },
    [index, reduceMotion],
  );

  useEffect(() => {
    const heroIsPinned = () => {
      const hero = document.getElementById("top");
      if (!hero) return false;
      const rect = hero.getBoundingClientRect();
      return rect.top > -16 && rect.bottom > window.innerHeight - 16;
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      if (!heroIsPinned()) return;

      if (event.deltaY > 0) {
        if (index >= slides.length - 1) return;
        event.preventDefault();
        goTo(index + 1, 1);
        return;
      }

      if (index <= 0) return;
      event.preventDefault();
      goTo(index - 1, -1);
    };

    const onKey = (event: KeyboardEvent) => {
      if (!heroIsPinned()) return;

      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        if (index >= slides.length - 1) return;
        event.preventDefault();
        goTo(index + 1, 1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        if (index <= 0) return;
        event.preventDefault();
        goTo(index - 1, -1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goTo, index]);

  useEffect(() => {
    if (reduceMotion) return;

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY, reduceMotion]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (window.scrollY > 24) return;
    if (info.offset.y < -70 || info.velocity.y < -500) goTo(index + 1, 1);
    if (info.offset.y > 70 || info.velocity.y > 500) goTo(index - 1, -1);
  };

  return (
    <section
      id="top"
      className="relative h-[100dvh] w-full overflow-hidden bg-[#1c2230]"
      aria-roledescription="carousel"
      aria-label="BLUEEYES story"
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={active.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : { duration: 1.05, ease: [0.22, 1, 0.36, 1] }
          }
          drag={reduceMotion ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.08}
          onDragEnd={onDragEnd}
          className="absolute inset-0"
        >
          <FullBleedPhoto
            src={active.image}
            mobileSrc={active.mobileImage}
            alt={active.imageAlt}
            direction={direction}
            reduceMotion={!!reduceMotion}
            rawX={rawX}
            rawY={rawY}
            priority={index === 0}
          />

          <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 pt-28 sm:px-8 sm:pb-28 lg:px-10 lg:pb-32">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="hero-copy max-w-4xl">
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/90"
                >
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 42 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.26,
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`display whitespace-pre-line text-white ${
                    index === 0
                      ? "text-[clamp(3.6rem,12vw,9rem)]"
                      : "text-[clamp(2.8rem,9vw,7.4rem)]"
                  }`}
                >
                  {index === 0 ? (
                    <>
                      blueeyes
                      <span className="text-signal-soft">.</span>
                    </>
                  ) : (
                    active.title
                  )}
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="hero-copy flex max-w-md flex-col items-start gap-6 text-left lg:pb-3"
              >
                <p className="panel-copy text-[1.02rem] leading-relaxed text-white sm:text-[1.1rem]">
                  {active.subtitle}
                </p>
                {active.cta ? (
                    <button
                      type="button"
                      className="cta-pill"
                      onClick={() => {
                        if (index === slides.length - 1) onContact?.();
                        else goTo(index + 1, 1);
                      }}
                    >
                    {active.cta}
                  </button>
                ) : null}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-y-0 right-4 z-20 flex flex-col items-center justify-center gap-3 sm:right-7">
        <div className="pointer-events-auto flex flex-col items-center gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className="nav-dot"
              data-active={i === index}
              onClick={() => goTo(i, i > index ? 1 : -1)}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 text-[0.68rem] uppercase tracking-[0.2em] text-white/85 sm:flex">
        <span className="hero-copy">Scroll</span>
        <motion.span
          aria-hidden
          animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block h-8 w-px bg-white/70"
        />
      </div>
    </section>
  );
}

function FullBleedPhoto({
  src,
  mobileSrc,
  alt,
  direction,
  reduceMotion,
  rawX,
  rawY,
  priority,
}: {
  src: string;
  mobileSrc: string;
  alt: string;
  direction: number;
  reduceMotion: boolean;
  rawX: MotionValue<number>;
  rawY: MotionValue<number>;
  priority: boolean;
}) {
  const x = useTransform(rawX, (v) => v * 16);
  const y = useTransform(rawY, (v) => v * 10);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-[-2%]"
        style={reduceMotion ? undefined : { x, y }}
        initial={reduceMotion ? false : { scale: 1.04, y: direction * 48 }}
        animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.035], y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : {
                scale: {
                  duration: 16,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                },
                y: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
              }
        }
      >
        <ResponsivePhoto
          src={src}
          mobileSrc={mobileSrc}
          alt={alt}
          priority={priority}
        />
      </motion.div>
    </div>
  );
}

function ResponsivePhoto({
  src,
  mobileSrc,
  alt,
  priority,
}: {
  src: string;
  mobileSrc: string;
  alt: string;
  priority: boolean;
}) {
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={src} />
      <img
        src={mobileSrc}
        alt={alt}
        width={1440}
        height={2560}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </picture>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "30%" : "-30%",
    opacity: 0,
  }),
  center: {
    y: "0%",
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? "-18%" : "18%",
    opacity: 0,
  }),
};
