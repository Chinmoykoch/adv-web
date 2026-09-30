"use client";

import { useState } from "react";
import CarCard from "./CarCard";
import CategoryFilter from "./CategoryFilter";
import { cars, type Category } from "./carData";

export default function CarFleet() {
  const [category, setCategory] = useState<Category>("All");
  const visibleCars = category === "All" ? cars : cars.filter((car) => car.categories.includes(category));

  return (
    <section id="cars" className="bg-canvas-light py-20 [--gutter:clamp(20px,5vw,80px)] sm:py-28">
      <div className="mx-auto w-[min(100%-2*var(--gutter),1280px)] px-3 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Curated Garage</p>
            <h2 className="text-[clamp(36px,4.2vw,56px)] leading-[1.08] tracking-[-.02em] text-secondary">
              Choose Your <em>Ride.</em>
            </h2>
          </div>
          <CategoryFilter active={category} onChange={setCategory} />
        </div>

        {/* Fixed column count keeps every card the same width, even when a filter shows fewer cars. */}
        <ul className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          {visibleCars.map((car) => (
            <li key={car.name}>
              <CarCard car={car} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
