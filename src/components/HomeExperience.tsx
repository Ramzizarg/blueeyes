"use client";

import { useCallback } from "react";
import { ContactSection } from "@/components/ContactSection";
import { Header } from "@/components/Header";
import { ImmersiveStory } from "@/components/ImmersiveStory";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/SmoothScroll";

export function HomeExperience() {
  const jumpContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <SmoothScroll />
      <div className="grain" aria-hidden />
      <Header onContact={jumpContact} />
      <main className="bg-[#0d1018]">
        <ImmersiveStory onContact={jumpContact} />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
