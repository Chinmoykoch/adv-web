import Image from "next/image";
import type { Car } from "./carData";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function CarCard({ car }: { car: Car }) {
  const specs = [car.fuel, car.transmission, car.seats];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_32px_-20px_#0004]">
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-neutral-100">
        <Image
          src={car.image}
          alt={car.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover ${car.imagePosition}`}
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-white ${
            car.featuredBadge ? "bg-primary" : "bg-black/60 backdrop-blur-sm"
          }`}
        >
          {car.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
        <h3 className="truncate font-heading text-lg font-semibold text-secondary">{car.name}</h3>
        <ul className="mb-5 mt-3 grid grid-cols-3 gap-1.5" aria-label="Specifications">
          {specs.map((spec) => (
            <li key={spec} className="truncate rounded-md bg-neutral-100 px-2 py-1 text-center text-[11px] font-medium text-neutral-700">
              {spec}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between border-t border-black/5 pt-4">
          <p>
            <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-neutral-500">Tariff</span>
            <span className="text-lg font-bold text-primary">{rupees.format(car.pricePerDay)}</span>
            <span className="text-xs text-neutral">/day</span>
          </p>
          <a
            href="#contact"
            aria-label={`Enquire about the ${car.name}`}
            className="group inline-flex min-h-11 items-center gap-1.5 text-xs font-bold uppercase tracking-[.08em] text-primary hover:text-primary-600"
          >
            Enquire
            <svg className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
