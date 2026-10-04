import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";
import JsonLd from "../../components/JsonLd";
import Navbar from "../../components/Navbar";
import CarCard from "../../components/landing/components/cars/CarCard";
import type { Car } from "../../components/landing/components/cars/carData";
import { getCar, getCars, getRedirect, getSiteSettings } from "../../lib/queries";
import { carSeoDescription, carSeoTitle, pageMetadata, truncate } from "../../lib/site";
import { carJsonLd } from "../../lib/structuredData";

// Cars published after the last build are rendered on their first visit, then cached.

export async function generateStaticParams() {
  return (await getCars()).map((car) => ({ slug: car.slug }));
}

const describe = (car: Car) => truncate(car.seoDescription || carSeoDescription(car));

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">) {
  const [car, settings] = await Promise.all([getCar((await params).slug), getSiteSettings()]);
  if (!car) return {};
  return pageMetadata({
    settings,
    title: car.seoTitle || carSeoTitle(car.name),
    description: describe(car),
    path: `/cars/${car.slug}`,
    image: car.image ? { url: car.image, alt: car.imageAlt } : undefined,
    seo: car,
  });
}

export default async function CarPage({ params }: PageProps<"/cars/[slug]">) {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) {
    // A renamed car keeps its old address working (301), so links and rankings carry over.
    const moved = await getRedirect(`/cars/${slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const allCars = await getCars();
  const otherCars = allCars.filter((other) => other.slug !== car.slug).slice(0, 3);
  const specs = [
    { label: "Fuel", value: car.fuel },
    { label: "Transmission", value: car.transmission },
    { label: "Seating", value: car.seats },
    { label: "Category", value: car.categories.join(", ") },
  ];

  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="py-10 sm:py-14">
          <JsonLd data={carJsonLd(car, describe(car))} />
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Cars", path: "/cars" }, { name: car.name, path: `/cars/${car.slug}` }]} />

          <article className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-neutral-100">
              {car.image && <Image src={car.image} alt={car.imageAlt} fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" style={{ objectPosition: car.imagePosition }} />}
              <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.08em] text-white ${car.featuredBadge ? "bg-primary" : "bg-black/60 backdrop-blur-sm"}`}>
                {car.badge}
              </span>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Self-drive rental · Guwahati</p>
              <h1 className="text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-.02em] text-secondary">{car.name}</h1>
              <p className="mt-5 text-lg leading-relaxed text-secondary/80">{car.description}</p>

              <dl className="mt-8 grid grid-cols-2 gap-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded-xl border border-black/5 bg-white px-4 py-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[.08em] text-neutral-500">{spec.label}</dt>
                    <dd className="mt-1 font-semibold text-secondary">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-black/10 pt-6">
                <p className="max-w-xs text-sm leading-6 text-secondary/80">Tell us your dates and we’ll confirm availability and the rate for your trip.</p>
                <Link href={`/contact?car=${car.slug}`} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-bold uppercase tracking-[.08em] text-white hover:bg-primary-600">
                  Enquire about this car
                </Link>
              </div>
            </div>
          </article>

          {otherCars.length > 0 && (
            <section aria-labelledby="other-cars" className="mt-20">
              <h2 id="other-cars" className="text-3xl tracking-tight text-secondary">More cars in our fleet</h2>
              <ul className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {otherCars.map((other) => (
                  <li key={other.slug}>
                    <CarCard car={other} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
