import type { BlogPost } from "../blogs/data";
import type { Car } from "../components/landing/components/cars/carData";
import { absoluteUrl, site, type SiteSettings } from "./site";

// Drops empty strings and arrays so unconfirmed business details are never published.
function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== "" && v !== undefined && !(Array.isArray(v) && v.length === 0)));
}

const areaServed = (settings: SiteSettings) => settings.business.areaServed.map((name) => ({ "@type": "Place", name }));

export function localBusinessJsonLd(settings: SiteSettings) {
  const b = settings.business;
  const latitude = Number(b.latitude), longitude = Number(b.longitude);
  return compact({
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": absoluteUrl("/#business"),
    name: settings.name,
    description: settings.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl(site.logo),
    image: absoluteUrl(settings.image.url),
    telephone: b.phone,
    email: b.email,
    priceRange: b.priceRange,
    // One line per schedule in the admin, e.g. "Mo-Fr 09:00-18:00".
    openingHours: b.openingHours ? b.openingHours.split("\n").map((line) => line.trim()).filter(Boolean) : undefined,
    address: compact({
      "@type": "PostalAddress",
      streetAddress: b.streetAddress,
      addressLocality: b.locality,
      addressRegion: b.region,
      postalCode: b.postalCode,
      addressCountry: b.country,
    }),
    geo: b.latitude && b.longitude && Number.isFinite(latitude) && Number.isFinite(longitude) ? { "@type": "GeoCoordinates", latitude, longitude } : undefined,
    areaServed: areaServed(settings),
    sameAs: b.sameAs,
  });
}

export function websiteJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: settings.name,
    url: absoluteUrl("/"),
    inLanguage: "en-IN",
    publisher: { "@id": absoluteUrl("/#business") },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function blogPostingJsonLd(post: BlogPost, description: string, settings: SiteSettings) {
  const url = absoluteUrl(`/blogs/${post.slug}`);
  return compact({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: post.title,
    description,
    image: post.image ? [absoluteUrl(post.image)] : undefined,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    articleSection: post.category,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: settings.name, url: absoluteUrl("/") },
    publisher: { "@id": absoluteUrl("/#business") },
  });
}

// Describes the car itself. There is no Offer: rates are shared on enquiry, and Google reports
// an Offer without a price as an error.
export function carJsonLd(car: Car, description: string) {
  const url = absoluteUrl(`/cars/${car.slug}`);
  return compact({
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#car`,
    name: car.name,
    description,
    url,
    image: car.image ? [absoluteUrl(car.image)] : undefined,
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    // "5/7 Seats" becomes 7: the largest configuration the car offers.
    vehicleSeatingCapacity: Math.max(...(car.seats.match(/\d+/g) ?? ["0"]).map(Number)) || undefined,
    category: car.categories.join(", "),
  });
}
