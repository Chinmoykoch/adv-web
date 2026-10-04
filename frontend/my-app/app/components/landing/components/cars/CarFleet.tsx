"use client";

import Link from "next/link";
import { useState } from "react";
import CarCard from "./CarCard";
import CategoryFilter from "./CategoryFilter";
import type { Car, Category } from "./carData";

export type FleetCopy = { eyebrow: string; heading: string; emphasis: string };

// The /cars page renders this as its main heading, with the category filter. On the home page it is a
// section heading over a short selection, with a link to the full fleet (`viewAll`) instead of the filter.
export default function CarFleet({ cars, copy, headingLevel = "h2", viewAll }: { cars: Car[]; copy: FleetCopy; headingLevel?: "h1" | "h2"; viewAll?: { href: string; label: string } }) {
  const [category, setCategory] = useState<Category>("All");
  const visibleCars = category === "All" ? cars : cars.filter((car) => car.categories.includes(category));
  const Heading = headingLevel;

  return (
    <section id="cars" className="bg-canvas-light py-20 [--gutter:clamp(20px,5vw,80px)] sm:py-28">
      <div className="mx-auto w-[min(100%-2*var(--gutter),1280px)] px-3 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            {copy.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">{copy.eyebrow}</p>}
            <Heading className="text-[clamp(36px,4.2vw,56px)] leading-[1.08] tracking-[-.02em] text-secondary">
              {copy.heading} {copy.emphasis && <em>{copy.emphasis}</em>}
            </Heading>
          </div>
          {viewAll ? (
            <Link href={viewAll.href} className="group/all inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 px-5 text-xs font-bold uppercase tracking-[.08em] text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white motion-reduce:transition-none">
              {viewAll.label}
              <svg className="transition-transform group-hover/all:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          ) : <CategoryFilter active={category} onChange={setCategory} />}
        </div>

        {/* Fixed column count keeps every card the same width, even when a filter shows fewer cars. */}
        <ul className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          {visibleCars.map((car) => (
            <li key={car.slug}>
              <CarCard car={car} headingLevel={headingLevel === "h1" ? "h2" : "h3"} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
