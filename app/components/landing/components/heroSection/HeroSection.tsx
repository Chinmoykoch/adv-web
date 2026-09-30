"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../Navbar";
import HeroBackground from "./HeroBackground";
import HeroContent, { slides } from "./HeroContent";
import SliderControls from "./SliderControls";
import ScrollIndicator from "./ScrollIndicator";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export const SLIDE_INTERVAL = 5000;

// Shared column for the navbar, hero text and controls; px-3/sm:px-5 matches the navbar pill padding.
const container = "mx-auto w-[min(100%-2*var(--gutter),1280px)]";

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setTimeout(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timer);
  }, [activeSlide, paused, reducedMotion]);

  return (
    <section
      className="relative isolate flex min-h-[max(740px,100svh)] w-full flex-col overflow-hidden bg-secondary text-white [--gutter:clamp(20px,5vw,80px)]"
      aria-label="AdventureCarz premium travel"
      aria-roledescription="carousel"
    >
      <HeroBackground activeSlide={activeSlide} />
      <div className={`${container} relative z-10 mt-4 sm:mt-6`}>
        <Navbar />
      </div>
      <div className={`${container} grid flex-1 grid-cols-12 items-end gap-x-6 px-3 pb-6 pt-22 sm:px-5 sm:pb-8 sm:pt-30 lg:items-center lg:py-10`}>
        <HeroContent activeSlide={activeSlide} />
      </div>
      <div className={`${container} relative mb-4 flex min-h-16 flex-wrap items-center justify-between gap-2 px-3 sm:flex-nowrap sm:justify-start sm:gap-0 sm:px-5`}>
        <SliderControls
          count={slides.length}
          activeSlide={activeSlide}
          paused={paused || reducedMotion}
          onSelect={setActiveSlide}
          onTogglePause={() => setPaused((value) => !value)}
          reducedMotion={reducedMotion}
        />
        <ScrollIndicator />
      </div>
    </section>
  );
}
