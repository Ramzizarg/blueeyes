"use client";

import { useCallback, useEffect, useState } from "react";
import { ContactSection } from "@/components/ContactSection";
import { Header } from "@/components/Header";
import { ImmersiveStory } from "@/components/ImmersiveStory";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll, scrollToTarget } from "@/components/SmoothScroll";
import {
  WelcomeGate,
  shouldShowWelcomeGate,
} from "@/components/WelcomeGate";

export function HomeExperience() {
  const [ready, setReady] = useState(false);
  const [showGate, setShowGate] = useState(true);

  useEffect(() => {
    const show = shouldShowWelcomeGate();
    setShowGate(show);
    setReady(true);
  }, []);

  const jumpContact = useCallback(() => {
    scrollToTarget("#contact", { duration: 1.2 });
  }, []);

  const openSite = useCallback(() => {
    setShowGate(false);
  }, []);

  if (!ready) {
    return <div className="min-h-[100dvh] bg-black" aria-hidden />;
  }

  return (
    <>
      {showGate ? <WelcomeGate onComplete={openSite} /> : null}

      {!showGate ? (
        <>
          <SmoothScroll />
          <div className="grain" aria-hidden />
          <Header onContact={jumpContact} />
          <main className="bg-white">
            <ImmersiveStory onContact={jumpContact} />
            <ContactSection />
          </main>
          <SiteFooter />
        </>
      ) : null}
    </>
  );
}
