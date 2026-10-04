import Image from "next/image";
import Link from "next/link";
import type { Car } from "./carData";

export default function CarCard({ car, headingLevel = "h3" }: { car: Car; headingLevel?: "h2" | "h3" }) {
  const specs = [car.fuel, car.transmission, car.seats].filter(Boolean);
  const Heading = headingLevel;

  return (
    // The name link stretches over the card; the Enquire link sits above it so both stay clickable.
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_32px_-20px_#0004] transition-shadow hover:shadow-[0_16px_36px_-18px_#0006] motion-reduce:transition-none">
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-neutral-100">
        <Image
          src={car.image}
          alt={car.imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: car.imagePosition }}
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
        <Heading className="truncate font-heading text-lg font-semibold text-secondary">
          <Link href={`/cars/${car.slug}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:outline-none group-focus-within:underline">
            {car.name}
          </Link>
        </Heading>
        <ul className="mb-5 mt-3 grid grid-cols-3 gap-1.5" aria-label="Specifications">
          {specs.map((spec) => (
            <li key={spec} className="truncate rounded-md bg-neutral-100 px-2 py-1 text-center text-[11px] font-medium text-neutral-700">
              {spec}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
          {/* A visual cue only: the card's name link already opens the car's page. */}
          <span aria-hidden="true" className="text-xs font-semibold text-neutral-500 transition-colors group-hover:text-secondary motion-reduce:transition-none">
            View details
          </span>
          <Link
            href={`/contact?car=${car.slug}`}
            aria-label={`Enquire about the ${car.name}`}
            className="group/enquire relative z-10 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold uppercase tracking-[.08em] text-primary hover:text-primary-600"
          >
            Enquire
            <svg className="transition-transform group-hover/enquire:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
