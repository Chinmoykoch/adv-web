"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Illustrative stock photography. Replace with approved customer trip photos.
const memories = [
  { image: "photo-1551632811-561732d1e306", title: "Together, a little further", category: "Mountain escapes", alt: "Travellers hiking together through a mountain landscape", description: "Fresh air, a scenic drive, and a trail shared with your favourite people. Make room for the moments beyond the destination." },
  { image: "photo-1529156069898-49953e39b3ac", title: "Good company. Great memories.", category: "Friends & getaways", alt: "Friends spending time together outdoors", description: "The best part of getting away is who comes along. Turn a free weekend into a shared adventure and a new story to bring home." },
  { image: "photo-1478131143081-fd1d3e8dc7a4", title: "A slower kind of weekend", category: "Camping weekends", alt: "A campsite in a scenic outdoor setting", description: "Leave the everyday rush behind for open skies and unhurried evenings. A comfortable journey is just the beginning of your escape." },
  { image: "photo-1500534623283-312aade485b7", title: "Take the scenic way", category: "Outstation journeys", alt: "Open countryside beneath a bright sky", description: "A change of scenery can change the whole weekend. Enjoy the stops along the way and travel at a pace that feels like your own." },
  { image: "photo-1464822759023-fed622ff2c3b", title: "Views worth the journey", category: "Hill station breaks", alt: "Dramatic mountain peaks rising into the clouds", description: "From winding roads to wide-open views, let your next outstation trip bring a little more wonder into the everyday." },
  { image: "photo-1507525428034-b723cf961d3e", title: "Chasing a little sunshine", category: "Coastal holidays", alt: "A sandy tropical beach beside clear blue water", description: "Pack for long conversations, ocean air, and time together. Some journeys are simply about finding a place to slow down." },
];

const photoUrl = (image: string, width: number) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`;

export default function HappyCustomers() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = memories[activeIndex];

  function selectPhoto(index: number, focus = false) {
    const next = (index + memories.length) % memories.length;
    setActiveIndex(next);
    if (focus) {
      thumbnailRefs.current[next]?.focus({ preventScroll: true });
      thumbnailRefs.current[next]?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" });
    }
  }

  function markFailed(image: string) {
    setFailedPhotos((current) => current.includes(image) ? current : [...current, image]);
  }

  return (
    <section aria-labelledby="happy-customers-heading" className="mt-20 border-t border-border/30 bg-canvas-light pt-12 sm:mt-28 sm:pt-16">
      <div className="grid gap-9 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <div className="flex flex-col justify-between gap-12 lg:pr-8">
          <div className="max-w-sm lg:ml-auto lg:pt-6">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">The people. The places. The memories.</p>
            <p className="text-sm leading-7 text-body">
              Behind every journey is a reason to get away. A family reunion,
              a weekend with friends, or a long-awaited outstation holiday.
              At AdventureCarz, we help make the miles in between feel just as
              special as the places you discover together.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium tabular-nums text-muted">A journey to remember / {String(activeIndex + 1).padStart(2, "0")}</p>
            <h2 id="happy-customers-heading" className="font-body text-[clamp(2.75rem,6.8vw,6.5rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.065em] text-secondary">
              Happy<br />customers.<br /><span className="text-primary">Lasting<br className="sm:hidden" /> memories.</span>
            </h2>
            <p className="mt-6 max-w-sm text-xs leading-5 text-muted">Travel inspiration gallery · Illustrative photos</p>
          </div>
        </div>

        <figure id="customer-featured-photo" className="min-w-0">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <Image
              key={active.image}
              src={failedPhotos.includes(active.image) ? "/banner3.png" : photoUrl(active.image, 1200)}
              alt={failedPhotos.includes(active.image) ? "Scenic journey overlooking a river valley" : active.alt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 45vw, 100vw"
              onError={() => markFailed(active.image)}
              className="object-cover motion-safe:animate-fade-in"
            />
          </div>
          <figcaption className="pt-3" aria-live="polite" aria-atomic="true">
            <div className="flex items-start justify-between gap-4 text-[10px] font-semibold uppercase tracking-wider text-secondary">
              <span className="tabular-nums">/{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-right">{active.category}</span>
            </div>
            <h3 className="mt-4 font-body text-lg font-semibold">{active.title}</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">{active.description}</p>
          </figcaption>
        </figure>
      </div>

      <div aria-label="Choose a travel photograph" className="mt-10 grid grid-flow-col auto-cols-[110px] gap-3 overflow-x-auto pb-4 sm:auto-cols-[145px] lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
        {memories.map((memory, index) => (
          <button
            key={memory.image}
            ref={(node) => { thumbnailRefs.current[index] = node; }}
            type="button"
            aria-label={`Show photo ${index + 1}: ${memory.title}`}
            aria-pressed={activeIndex === index}
            aria-controls="customer-featured-photo"
            onClick={() => selectPhoto(index)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              selectPhoto(event.key === "Home" ? 0 : event.key === "End" ? memories.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1), true);
            }}
            className="group min-w-0 cursor-pointer text-left"
          >
            <span className={`mb-2 flex justify-between text-[10px] font-semibold tabular-nums ${activeIndex === index ? "text-primary" : "text-muted"}`}>
              /{String(index + 1).padStart(2, "0")}<span aria-hidden="true">{activeIndex === index ? "●" : "↗"}</span>
            </span>
            <span className={`relative block aspect-[3/4] overflow-hidden bg-surface ${activeIndex === index ? "ring-2 ring-primary ring-offset-2 ring-offset-canvas-light" : ""}`}>
              <Image
                src={failedPhotos.includes(memory.image) ? "/banner3.png" : photoUrl(memory.image, 400)}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 1024px) 16vw, 145px"
                onError={() => markFailed(memory.image)}
                className={`object-cover transition-[filter,transform] duration-300 group-hover:scale-[1.03] group-hover:grayscale-0 group-focus-visible:grayscale-0 motion-reduce:transition-none ${activeIndex === index ? "" : "grayscale"}`}
              />
            </span>
            <span className="mt-3 block text-[10px] font-medium uppercase tracking-wide text-muted">{memory.category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
