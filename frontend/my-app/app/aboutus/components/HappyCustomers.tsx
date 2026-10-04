"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { HappyCustomer } from "../../lib/queries";

export type HappyCustomersCopy = { eyebrow: string; heading: string; description: string; note: string };

// Shown if a photo fails to load (for example a removed external image).
const FALLBACK = { src: "/banner3.png", alt: "Scenic journey overlooking a river valley" };

// Photos and captions come from the Happy Customers collection; the text from the About Us page.
export default function HappyCustomers({ photos, copy }: { photos: HappyCustomer[]; copy: HappyCustomersCopy }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = photos.filter((photo) => photo.image);
  if (shown.length === 0) return null;
  const active = shown[activeIndex] ?? shown[0];
  // "Happy customers. Lasting memories.": the second sentence is highlighted, as in the original design.
  const [headingLead, ...headingRest] = copy.heading.split(/(?<=\.)\s+/);

  function selectPhoto(index: number, focus = false) {
    const next = (index + shown.length) % shown.length;
    setActiveIndex(next);
    if (focus) {
      thumbnailRefs.current[next]?.focus({ preventScroll: true });
      thumbnailRefs.current[next]?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" });
    }
  }

  const source = (photo: HappyCustomer) => (failedPhotos.includes(photo.id) ? FALLBACK.src : photo.image!);
  const markFailed = (id: string) => setFailedPhotos((current) => (current.includes(id) ? current : [...current, id]));

  return (
    <section aria-labelledby="happy-customers-heading" className="mt-20 border-t border-border/30 bg-canvas-light pt-12 sm:mt-28 sm:pt-16">
      <div className="grid gap-9 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <div className="flex flex-col justify-between gap-12 lg:pr-8">
          <div className="max-w-sm lg:ml-auto lg:pt-6">
            {copy.eyebrow && <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{copy.eyebrow}</p>}
            {copy.description && <p className="text-sm leading-7 text-body">{copy.description}</p>}
          </div>

          <div>
            <p className="mb-4 text-xs font-medium tabular-nums text-muted">A journey to remember / {String(activeIndex + 1).padStart(2, "0")}</p>
            <h2 id="happy-customers-heading" className="font-body text-[clamp(2.75rem,6.8vw,6.5rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.065em] text-secondary">
              {headingLead}{headingRest.length > 0 && <><br /><span className="text-primary">{headingRest.join(" ")}</span></>}
            </h2>
            {copy.note && <p className="mt-6 max-w-sm text-xs leading-5 text-muted">{copy.note}</p>}
          </div>
        </div>

        <figure id="customer-featured-photo" className="min-w-0">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <Image
              key={active.id}
              src={source(active)}
              alt={failedPhotos.includes(active.id) ? FALLBACK.alt : active.imageAlt ?? ""}
              fill
              unoptimized
              sizes="(min-width: 1024px) 45vw, 100vw"
              onError={() => markFailed(active.id)}
              className="object-cover motion-safe:animate-fade-in"
            />
          </div>
          <figcaption className="pt-3" aria-live="polite" aria-atomic="true">
            <div className="flex items-start justify-between gap-4 text-[10px] font-semibold uppercase tracking-wider text-secondary">
              <span className="tabular-nums">/{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-right">{active.category}</span>
            </div>
            <h3 className="mt-4 font-body text-lg font-semibold">{active.title}</h3>
            {active.caption && <p className="mt-2 max-w-md text-sm leading-6 text-muted">{active.caption}</p>}
          </figcaption>
        </figure>
      </div>

      <div aria-label="Choose a travel photograph" className="mt-10 grid grid-flow-col auto-cols-[110px] gap-3 overflow-x-auto pb-4 sm:auto-cols-[145px] lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
        {shown.map((photo, index) => (
          <button
            key={photo.id}
            ref={(node) => { thumbnailRefs.current[index] = node; }}
            type="button"
            aria-label={`Show photo ${index + 1}: ${photo.title}`}
            aria-pressed={activeIndex === index}
            aria-controls="customer-featured-photo"
            onClick={() => selectPhoto(index)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              selectPhoto(event.key === "Home" ? 0 : event.key === "End" ? shown.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1), true);
            }}
            className="group min-w-0 cursor-pointer text-left"
          >
            <span className={`mb-2 flex justify-between text-[10px] font-semibold tabular-nums ${activeIndex === index ? "text-primary" : "text-muted"}`}>
              /{String(index + 1).padStart(2, "0")}<span aria-hidden="true">{activeIndex === index ? "●" : "↗"}</span>
            </span>
            <span className={`relative block aspect-[3/4] overflow-hidden bg-surface ${activeIndex === index ? "ring-2 ring-primary ring-offset-2 ring-offset-canvas-light" : ""}`}>
              <Image
                src={source(photo)}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 1024px) 16vw, 145px"
                onError={() => markFailed(photo.id)}
                className={`object-cover transition-[filter,transform] duration-300 group-hover:scale-[1.03] group-hover:grayscale-0 group-focus-visible:grayscale-0 motion-reduce:transition-none ${activeIndex === index ? "" : "grayscale"}`}
              />
            </span>
            <span className="mt-3 block text-[10px] font-medium uppercase tracking-wide text-muted">{photo.category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
