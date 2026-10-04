"use client";

import { useState } from "react";
import Image from "next/image";
import type { Service as ServiceEntry } from "../../../../lib/queries";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// Icons follow the order of the Services collection and repeat if more services are added.
const icons = [
  <svg key="car" {...iconProps}><path d="M5 17h14M6 17l1.5-6h9L18 17M8 11l1.5-4h5L16 11M7 17v2m10-2v2" /></svg>,
  <svg key="person" {...iconProps}><circle cx="12" cy="6" r="3" /><path d="M6 21v-3a6 6 0 0 1 12 0v3" /></svg>,
  <svg key="plane" {...iconProps}><path d="M2 16l20-6-3-2-6 2-6-6-2 1 4 6-4 1-2-2-1 1z" /><path d="M3 21h18" /></svg>,
  <svg key="mountain" {...iconProps}><path d="m3 20 6-10 4 6 3-4 5 8z" /></svg>,
];

export type ServicesCopy = { eyebrow: string; heading: string; emphasis: string; description: string };

export default function Service({ copy, services }: { copy: ServicesCopy; services: ServiceEntry[] }) {
  const [active, setActive] = useState(0);
  if (services.length === 0) return null;
  const feature = services[active] ?? services[0];

  return (
    <section id="services" className="bg-canvas py-20 [--gutter:clamp(20px,5vw,80px)] sm:py-28">
      <div className="mx-auto w-[min(100%-2*var(--gutter),1280px)] px-3 sm:px-5">
        {copy.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">{copy.eyebrow}</p>}
        <h2 className="max-w-md text-[clamp(36px,4.2vw,56px)] leading-[1.08] tracking-[-.02em] text-secondary">
          {copy.heading} {copy.emphasis && <em>{copy.emphasis}</em>}
        </h2>
        {copy.description && <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-neutral sm:text-base">{copy.description}</p>}

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ul className="grid gap-3" aria-label="Services">
            {services.map((service, index) => {
              const selected = index === active;
              return (
                <li key={service.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    className={`w-full cursor-pointer rounded-2xl border px-5 py-4 text-left transition-[background-color,border-color,box-shadow] motion-reduce:transition-none ${
                      selected
                        ? "border-primary/25 bg-white shadow-[0_10px_30px_-18px_#d6460066]"
                        : "border-black/5 bg-card hover:border-black/10 hover:bg-white"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="text-[11px] font-bold uppercase tracking-[.12em] text-primary">
                        {String(index + 1).padStart(2, "0")}{service.label ? ` / ${service.label}` : ""}
                      </span>
                      <span className={selected ? "text-primary" : "text-neutral-400"}>{icons[index % icons.length]}</span>
                    </span>
                    <span className="mt-1 block font-heading text-lg font-semibold uppercase text-secondary">{service.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-neutral">{service.description}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative min-h-105 overflow-hidden rounded-3xl bg-secondary shadow-[0_24px_60px_-20px_#0006] lg:min-h-0">
            {services.map((item, index) => item.image && (
              <Image
                key={item.id}
                src={item.image}
                alt={index === active ? item.imageAlt ?? "" : ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(0deg,#000d_0%,#0008_35%,#0000_65%)]" />
            <div key={feature.id} className="absolute inset-x-0 bottom-0 animate-fade-in p-6 text-white motion-reduce:animate-none sm:p-8" aria-live="polite">
              {feature.featureBadge && <span className="inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">
                {feature.featureBadge}
              </span>}
              {feature.featureTitle && <h3 className="mt-3 max-w-md font-heading text-2xl leading-snug text-white sm:text-[28px]">{feature.featureTitle}</h3>}
              {feature.featureDescription && <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{feature.featureDescription}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
