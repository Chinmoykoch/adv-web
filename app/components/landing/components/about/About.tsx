"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      // Heading lines slide in from the right as the section scrolls into view; skipped for reduced motion.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-heading-line]", {
          x: (index: number) => 120 + index * 80,
          opacity: 0,
          ease: "none",
          stagger: 0.15,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 90%",
            end: "top 45%",
            scrub: true,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className="overflow-x-clip bg-canvas-light py-20 [--gutter:clamp(20px,5vw,80px)] sm:py-28"
    >
      <div className="mx-auto grid w-[min(100%-2*var(--gutter),1280px)] items-center gap-12 px-3 sm:px-5 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_24px_60px_-20px_#0006]">
          <Image
            src="/car2.png"
            alt="Adventure Carz SUV with a roof tent on a gravel track through the mountains"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[60%_50%]"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:inset-x-5 sm:bottom-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Overland certified</p>
              <p className="text-sm font-semibold text-secondary">High-altitude calibrated &amp; tested</p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.4-1.8 1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">About Adventure Carz</p>
          <h2 ref={headingRef} className="text-[clamp(36px,4.2vw,56px)] leading-[1.08] tracking-[-.02em] text-secondary">
            <span data-heading-line className="block">DRIVE YOUR WAY.</span>
            <span data-heading-line className="block">EXPLORE NORTHEAST.</span>
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-[1.7] text-neutral sm:text-base">
            <p>
              At AdventureCarz, we make self-drive car rentals simple, convenient, and stress-free. Whether you’re heading out for a weekend getaway, travelling for work, catching a flight, or planning a road trip across Assam and the Northeast, you get a well-maintained car and the freedom to travel your way.
            </p>
            <p>
              From choosing the right car to getting back home, we keep the rental experience straightforward. With transparent pricing, flexible rental options, and dependable support whenever you need it, we’re here to make every drive comfortable, smooth, and worth remembering.
            </p>
          </div>
          <a
            href="/contact"
            className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[.08em] text-primary hover:text-primary-600"
          >
            Our Story
            <svg className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
