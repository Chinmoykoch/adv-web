"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

type ServiceItem = {
  tag: string;
  title: string;
  description: string;
  icon: ReactNode;
  feature: { image: string; alt: string; badge: string; title: string; description: string };
};

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

const services: ServiceItem[] = [
  {
    tag: "Freedom",
    title: "SELF-DRIVE CAR RENTALS",
    description: "Drive on your own schedule with our fleet of clean, well-maintained vehicles. Perfect for city travel, business trips, family outings, and Northeast road adventures.",
    icon: <svg {...iconProps}><path d="M5 17h14M6 17l1.5-6h9L18 17M8 11l1.5-4h5L16 11M7 17v2m10-2v2" /></svg>,
    feature: {
      image: "/car1.png",
      alt: "Black sedan driving along a forest road",
      badge: "Self-drive certified",
      title: "Effortless Key Handover & GPS Guided Freedom",
      description: "Delivered right to your doorstep or airport terminal with full tank and sanitization certification.",
    },
  },
  {
    tag: "Executive",
    title: "AIRPORT CAR DELIVERY",
    description: "Get your self-drive car delivered directly to Lokpriya Gopinath Bordoloi International Airport and start your journey the moment you arrive.",
    icon: <svg {...iconProps}><circle cx="12" cy="6" r="3" /><path d="M6 21v-3a6 6 0 0 1 12 0v3" /></svg>,
    feature: {
      image: "/car3.png",
      alt: "White MPV parked outside a modern villa at sunset",
      badge: "Chauffeur driven",
      title: "Sit Back While a Vetted Driver Takes the Wheel",
      description: "Trained drivers who know the routes, arriving on time and ready when you are.",
    },
  },
  {
    tag: "Concierge",
    title: "DOORSTEP CAR DELIVERY",
    description: "Skip the hassle of pickup locations. We deliver your booked vehicle directly to your home, hotel, or preferred location in Guwahati.",
    icon: <svg {...iconProps}><path d="M2 16l20-6-3-2-6 2-6-6-2 1 4 6-4 1-2-2-1 1z" /><path d="M3 21h18" /></svg>,
    feature: {
      image: "/banner3.png",
      alt: "SUV parked on a hillside road overlooking the Brahmaputra",
      badge: "Flight tracked",
      title: "Met at Arrivals, Driven Straight to Your Stay",
      description: "We track your flight, wait at the terminal, and handle the luggage for you.",
    },
  },
  {
    tag: "Expeditions",
    title: "LOCAL & OUTSTATION SELF-DRIVE",
    description: "Whether you’re exploring Guwahati or planning a trip across Assam and the Northeast, enjoy the convenience and flexibility of self-drive travel.",
    icon: <svg {...iconProps}><path d="m3 20 6-10 4 6 3-4 5 8z" /></svg>,
    feature: {
      image: "/car2.png",
      alt: "SUV with a roof tent on a gravel mountain track",
      badge: "Overland ready",
      title: "Rigs Built for High Passes and Rough Roads",
      description: "High-clearance 4x4s with roof carriers and all-weather gear for the long way round.",
    },
  },
];

export default function Service() {
  const [active, setActive] = useState(0);
  const feature = services[active].feature;

  return (
    <section id="services" className="bg-canvas py-20 [--gutter:clamp(20px,5vw,80px)] sm:py-28">
      <div className="mx-auto w-[min(100%-2*var(--gutter),1280px)] px-3 sm:px-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Services &amp; Experiences</p>
        <h2 className="max-w-md text-[clamp(36px,4.2vw,56px)] leading-[1.08] tracking-[-.02em] text-secondary">
          MORE THAN A RENTAL. <em> IT'S YOUR JOURNEY.</em>
        </h2>
        <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-neutral sm:text-base">
          Your journey starts with the right car. From exploring Guwahati to heading out on a road trip across Assam and the Northeast, AdventureCarz gives you the freedom to drive at your own pace, with convenient doorstep and airport delivery options.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ul className="grid gap-3" aria-label="Services">
            {services.map((service, index) => {
              const selected = index === active;
              return (
                <li key={service.title}>
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
                        {String(index + 1).padStart(2, "0")} / {service.tag}
                      </span>
                      <span className={selected ? "text-primary" : "text-neutral-400"}>{service.icon}</span>
                    </span>
                    <span className="mt-1 block font-heading text-lg font-semibold text-secondary">{service.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-neutral">{service.description}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative min-h-105 overflow-hidden rounded-3xl bg-secondary shadow-[0_24px_60px_-20px_#0006] lg:min-h-0">
            {services.map(({ feature: item }, index) => (
              <Image
                key={item.image + index}
                src={item.image}
                alt={index === active ? item.alt : ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(0deg,#000d_0%,#0008_35%,#0000_65%)]" />
            <div key={active} className="absolute inset-x-0 bottom-0 animate-fade-in p-6 text-white motion-reduce:animate-none sm:p-8" aria-live="polite">
              <span className="inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">
                {feature.badge}
              </span>
              <h3 className="mt-3 max-w-md font-heading text-2xl leading-snug text-white sm:text-[28px]">{feature.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{feature.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
