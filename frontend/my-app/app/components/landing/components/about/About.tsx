"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type AboutCopy = {
  eyebrow: string; heading: string; paragraphs: string[]; image: string; imageAlt: string;
  badgeLabel: string; badgeText: string; buttonLabel: string; buttonHref: string;
};

export default function About({ eyebrow, heading, paragraphs, image, imageAlt, badgeLabel, badgeText, buttonLabel, buttonHref }: AboutCopy) {
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
          {image && <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[60%_50%]"
          />}
          {(badgeLabel || badgeText) && <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:inset-x-5 sm:bottom-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{badgeLabel}</p>
              <p className="text-sm font-semibold text-secondary">{badgeText}</p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.4-1.8 1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
          </div>}
        </div>

        <div>
          {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p>}
          <h2 ref={headingRef} className="text-[clamp(36px,4.2vw,56px)] leading-[1.08] tracking-[-.02em] text-secondary">
            {/* Each line of the heading field animates in on its own. */}
            {heading.split(/\n/).filter((line) => line.trim()).map((line) => <span key={line} data-heading-line className="block">{line}</span>)}
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-[1.7] text-neutral sm:text-base">
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {buttonLabel && <a
            href={buttonLabel.trim().toLowerCase() === "our story" && buttonHref === "/contact" ? "/aboutus" : buttonHref || "/aboutus"}
            className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[.08em] text-primary hover:text-primary-600"
          >
            {buttonLabel}
            <svg className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </a>}
        </div>
      </div>
    </section>
  );
}
