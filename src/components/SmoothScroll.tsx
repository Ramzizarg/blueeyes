"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { slides } from "@/lib/slides";

declare global {
  interface Window {
    __blueeyesLenis?: Lenis;
  }
}

function isTouchScrollDevice() {
  if (typeof window === "undefined") return true;
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

export function scrollToTarget(
  target: string | HTMLElement | number,
  options?: { duration?: number; offset?: number },
) {
  const lenis = window.__blueeyesLenis;
  if (lenis) {
    lenis.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    return;
  }

  if (typeof target === "number") {
    window.scrollTo({ top: target + (options?.offset ?? 0), behavior: "smooth" });
    return;
  }

  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function storyPanels() {
  return slides
    .map((slide) => document.getElementById(`slide-${slide.id}`))
    .filter(Boolean) as HTMLElement[];
}

function contactTop() {
  const contact = document.getElementById("contact");
  return contact ? contact.getBoundingClientRect().top : Infinity;
}

function inContactZone() {
  return contactTop() < window.innerHeight * 0.55;
}

/** Past the last story panel — free scroll into contact, no panel snap. */
function pastStory() {
  const panels = storyPanels();
  const last = panels[panels.length - 1];
  if (!last) return false;
  return last.getBoundingClientRect().bottom < window.innerHeight * 0.55;
}

function nearestStoryPanel(maxDistanceRatio = 0.48) {
  if (inContactZone() || pastStory()) return null;

  const panels = storyPanels();
  let best: HTMLElement | null = null;
  let bestDist = Infinity;

  for (const panel of panels) {
    const dist = Math.abs(panel.getBoundingClientRect().top);
    if (dist < bestDist) {
      bestDist = dist;
      best = panel;
    }
  }

  if (!best) return null;
  if (bestDist < 10) return null;
  if (bestDist > window.innerHeight * maxDistanceRatio) return null;
  return best;
}

export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = isTouchScrollDevice();

    // Instagram / mobile WebViews need native scroll — Lenis causes lag there
    document.documentElement.dataset.scrollMode = touch || reduce ? "native" : "smooth";

    if (reduce || touch) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.95,
    });

    window.__blueeyesLenis = lenis;

    let settleTimer = 0;
    let snapping = false;
    let sectionLock = false;
    let wheelCarry = 0;
    let wheelReset = 0;
    let lastDir: -1 | 0 | 1 = 0;

    const snapTo = (el: HTMLElement, duration = 0.95) => {
      if (snapping) return;
      snapping = true;
      sectionLock = true;
      lenis.scrollTo(el, {
        offset: 0,
        duration,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          snapping = false;
          window.setTimeout(() => {
            sectionLock = false;
          }, 80);
        },
      });
    };

    const settleSnap = () => {
      if (snapping || sectionLock) return;
      // Never fight the user inside contact or while leaving it upward.
      if (inContactZone() || pastStory()) return;
      if (lastDir < 0 && contactTop() < window.innerHeight * 0.92) return;
      const target = nearestStoryPanel(0.38);
      if (!target) return;
      snapTo(target, 0.75);
    };

    lenis.on("scroll", (instance) => {
      lastDir = instance.direction < 0 ? -1 : instance.direction > 0 ? 1 : 0;
      window.clearTimeout(settleTimer);
      if (snapping || sectionLock) return;
      if (inContactZone() || pastStory()) return;
      settleTimer = window.setTimeout(settleSnap, 110);
    });

    const onWheel = (event: WheelEvent) => {
      if (sectionLock || snapping) return;
      if (Math.abs(event.deltaY) < 8) return;

      // Free native Lenis scrolling inside contact / footer — no panel lock.
      if (inContactZone() || pastStory()) {
        wheelCarry = 0;
        return;
      }

      const panels = storyPanels();
      if (panels.length === 0) return;

      const resting = panels.findIndex(
        (panel) => Math.abs(panel.getBoundingClientRect().top) < 36,
      );
      if (resting < 0) return;

      wheelCarry += event.deltaY;
      window.clearTimeout(wheelReset);
      wheelReset = window.setTimeout(() => {
        wheelCarry = 0;
      }, 200);

      if (Math.abs(wheelCarry) < 42) return;

      const goingDown = wheelCarry > 0;
      wheelCarry = 0;

      const next = goingDown ? resting + 1 : resting - 1;
      if (next < 0) return;

      event.preventDefault();

      if (next >= panels.length) {
        const contact = document.getElementById("contact");
        if (contact) snapTo(contact, 0.95);
        return;
      }

      snapTo(panels[next], 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.clearTimeout(wheelReset);
      window.removeEventListener("wheel", onWheel);
      lenis.destroy();
      delete window.__blueeyesLenis;
      delete document.documentElement.dataset.scrollMode;
    };
  }, []);

  return null;
}
