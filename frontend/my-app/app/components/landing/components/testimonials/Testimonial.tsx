"use client";

import { useState } from "react";
import type { Testimonial as Review } from "../../../../lib/queries";

export type TestimonialsCopy = { eyebrow: string; heading: string; emphasis: string };

function GoogleAttribution({ review }: { review: Review }) {
  if (review.source !== "google" || !review.sourceUrl) return null;
  return <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center text-xs text-primary underline-offset-4 hover:underline">
    Selected Google review <span aria-hidden="true" className="ml-1">↗</span>
    <span className="sr-only"> (opens the business on Google Maps in a new tab)</span>
  </a>;
}

// Filled stars for the review's rating; reviews saved without a rating show five.
function Stars({ rating }: { rating: number | null }) {
  const filled = Math.min(5, Math.max(1, Math.round(rating ?? 5)));
  return (
    <div className="flex gap-1 text-primary" role="img" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} aria-hidden="true" viewBox="0 0 24 24" className={`size-4 ${index < filled ? "" : "opacity-25"}`} fill="currentColor">
          <path d="m12 2 2.9 6.2 6.8.9-5 4.8 1.3 6.8-6-3.3-6 3.3 1.3-6.8-5-4.8 6.8-.9Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonial({ copy, testimonials }: { copy: TestimonialsCopy; testimonials: Review[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (testimonials.length === 0) return null;
  const active = testimonials[activeIndex] ?? testimonials[0];
  const several = testimonials.length > 1;
  const next = testimonials[(activeIndex + 1) % testimonials.length];

  function navigate(direction: number) {
    setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      className="bg-canvas py-20 [--gutter:clamp(20px,5vw,80px)] sm:py-24"
    >
      <div className="mx-auto w-[min(100%-2*var(--gutter),1280px)] px-3 sm:px-5">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            {copy.eyebrow && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{copy.eyebrow}</p>}
            <h2 id="testimonials-heading" className="text-[clamp(34px,4vw,48px)] leading-tight tracking-[-0.025em] text-secondary">
              {copy.heading} {copy.emphasis && <em>{copy.emphasis}</em>}
            </h2>
          </div>

          {several && <div className="flex items-center gap-2 pb-1">
            <span className="mr-2 flex gap-2 text-[10px] tabular-nums" aria-label={`Review ${activeIndex + 1} of ${testimonials.length}`}>
              <span className="font-bold text-secondary">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-muted">/</span>
              <span className="text-muted">{String(testimonials.length).padStart(2, "0")}</span>
            </span>
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction === -1 ? "Previous review" : "Next review"}
                aria-controls="featured-testimonial"
                onClick={() => navigate(direction)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-black/[0.08] bg-white text-secondary transition-colors hover:border-primary/30 hover:bg-primary/5 motion-reduce:transition-none"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={direction === -1 ? "m14 8-4 4 4 4" : "m10 8 4 4-4 4"} />
                </svg>
              </button>
            ))}
          </div>}
        </div>

        <div className={`grid gap-5 ${several ? "md:grid-cols-[2.08fr_1fr]" : ""}`}>
          <div id="featured-testimonial" aria-live="polite" aria-atomic="true" className="flex">
            <figure key={activeIndex} className="flex min-h-[280px] w-full flex-col rounded-[20px] border border-black/[0.08] bg-white p-6 shadow-[0_3px_3px_#0000001a] motion-safe:animate-fade-in sm:p-10">
              <Stars rating={active.rating} />
              <blockquote className="mb-7 mt-5 font-heading text-[clamp(20px,2.1vw,26px)] italic leading-[1.25] text-secondary">
                &ldquo;{active.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center justify-between gap-4 border-t border-black/[0.03] pt-5">
                <div>
                  <p className="font-heading text-sm font-semibold text-secondary">{active.customerName}</p>
                  {active.tripOrRole && <p className="text-[10px] leading-relaxed text-body">{active.tripOrRole}</p>}
                  <GoogleAttribution review={active} />
                </div>
                <span aria-hidden="true" className="font-heading text-5xl font-bold leading-none text-black/10">&rdquo;</span>
              </figcaption>
            </figure>
          </div>

          {several && <aside aria-label="Next review preview" className="flex min-h-[260px] flex-col rounded-[20px] border border-dashed border-black/[0.08] bg-white/50 p-6 sm:p-7">
            <p className="mb-3 text-[9px] font-bold uppercase text-neutral-400">Next Review</p>
            <div className="opacity-80"><Stars rating={next.rating} /></div>
            <figure className="mt-4 flex flex-1 flex-col">
              <blockquote className="mb-7 font-heading text-sm italic leading-[1.5] text-neutral-500">
                &ldquo;{next.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto border-t border-black/[0.03] pt-4">
                <p className="text-[10px] font-bold text-neutral">{next.customerName}</p>
                {next.tripOrRole && <p className="text-[9px] leading-relaxed text-neutral-500">{next.tripOrRole}</p>}
                <GoogleAttribution review={next} />
              </figcaption>
            </figure>
          </aside>}
        </div>
      </div>
    </section>
  );
}
