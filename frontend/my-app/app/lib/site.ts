import type { Metadata } from "next";

// Starter values for site-wide SEO and business details. The live values are edited in the
// admin panel (Site settings) and read through getSiteSettings(); these are the fallbacks and
// the seed data.
export const site = {
  name: "AdventureCarz",
  // Set NEXT_PUBLIC_SITE_URL to the production domain (no trailing slash) so canonical
  // URLs, the sitemap and social previews point at the live site.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  title: "Self-Drive Car Rental in Guwahati, Assam",
  description:
    "Self-drive car rentals in Guwahati with doorstep and airport delivery. Hatchbacks to 7-seat SUVs for trips across Assam and the Northeast.",
  locale: "en_IN",
  image: { url: "/car1.png", width: 1264, height: 848, alt: "An AdventureCarz car on a forest road" },
  logo: "/logo.jpeg",
  // Leave a field empty until the real value is confirmed; empty fields are left out of
  // the structured data rather than published as placeholders.
  business: {
    // One number per line; the first is the main number published to Google.
    phone: "+91 7002458987\n+91 9678449177",
    email: "",
    streetAddress: "38, Ground Floor, House No, Lakshmi Nagar Rd, opposite Nursery Field, Sundarpur",
    locality: "Guwahati",
    region: "Assam",
    postalCode: "781005",
    country: "IN",
    latitude: "26.154483",
    longitude: "91.784658",
    // schema.org format, for example "Mo-Su 08:00-20:00". "Mo-Su 00:00-23:59" means open 24 hours.
    openingHours: "Mo-Su 00:00-23:59",
    priceRange: "₹₹",
    areaServed: ["Guwahati", "Assam", "Northeast India"],
    // Google Business Profile, Instagram, Facebook and similar profile links.
    sameAs: [
      "https://www.instagram.com/adventurecarz",
      "https://www.facebook.com/share/1HpHKxXeHp/",
      "https://maps.app.goo.gl/oiKsf6HrPQ3C23eG9",
    ],
  },
  // The Google Maps listing, linked from the address on the Contact page and in the footer.
  mapLink: "https://maps.app.goo.gl/oiKsf6HrPQ3C23eG9",
};

export type SiteSettings = {
  name: string;
  title: string;
  description: string;
  image: { url: string; alt: string };
  googleVerification: string;
  business: Omit<typeof site.business, "areaServed" | "sameAs"> & { areaServed: string[]; sameAs: string[] };
};

const lines = (value: string | undefined) => (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

// Turns the Site settings page (flat text fields) into typed settings, falling back to the
// starter values for anything left empty.
export function resolveSiteSettings(content: Record<string, string>): SiteSettings {
  const text = (key: string, fallback: string) => content[key]?.trim() || fallback;
  const b = site.business;
  return {
    name: text("siteName", site.name),
    title: text("defaultSeoTitle", site.title),
    description: text("defaultSeoDescription", site.description),
    image: { url: text("shareImage", site.image.url), alt: text("shareImageAlt", site.image.alt) },
    googleVerification: content.googleVerification?.trim() ?? "",
    business: {
      phone: text("phone", b.phone), email: text("email", b.email), streetAddress: text("streetAddress", b.streetAddress),
      locality: text("locality", b.locality), region: text("region", b.region), postalCode: text("postalCode", b.postalCode),
      country: text("country", b.country), latitude: text("latitude", b.latitude), longitude: text("longitude", b.longitude),
      openingHours: text("openingHours", b.openingHours), priceRange: text("priceRange", b.priceRange),
      areaServed: content.areaServed !== undefined ? lines(content.areaServed) : b.areaServed,
      sameAs: (lines(content.sameAs).length ? lines(content.sameAs) : b.sameAs).filter((url) => url.startsWith("https://")),
    },
  };
}

// Several phone numbers may be entered, one per line; the first is the main one.
export const phoneNumbers = (phone: string) => lines(phone.replace(/,/g, "\n"));
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// wa.me needs the country code; a 10-digit Indian mobile number typed without it gets 91.
// Returns "" when the number is too short to be valid.
export function whatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  return number.length < 11 ? "" : number;
}

// Opening hours are stored in schema.org format for Google; visitors see "Open 24 hours" instead
// of "Mo-Su 00:00-23:59". Other schedules are shown as entered.
export const openingHoursText = (value: string) =>
  lines(value).map((line) => (/^Mo-Su 00:00-(23:59|24:00)$/i.test(line) ? "Open 24 hours, every day" : line)).join("\n");

export const absoluteUrl = (path = "/") => new URL(path, `${site.url}/`).toString();

// Per-page search controls set in the admin panel (articles, cars and pages).
export type SeoControls = { noindex?: boolean; canonicalUrl?: string; shareImage?: string; shareImageAlt?: string };

// Pages store every field as text; the "Hide from Google" checkbox is saved as "true".
export const pageSeoControls = (content: Record<string, string>): SeoControls => ({
  noindex: content.noindex === "true",
  canonicalUrl: content.canonicalUrl?.trim() || undefined,
  shareImage: content.shareImage?.trim() || undefined,
  shareImageAlt: content.shareImageAlt?.trim() || undefined,
});

// The sitemap lists only pages Google should index under their own address: a hidden page, or one
// whose main version lives elsewhere, would only send Google mixed signals.
export const inSitemap = (path: string, seo: SeoControls) =>
  !seo.noindex && (!seo.canonicalUrl || absoluteUrl(seo.canonicalUrl) === absoluteUrl(path));

type ShareImage = { url: string; alt: string; width?: number; height?: number };

// Child segments replace (not merge) the parent's openGraph object, so every page builds
// its metadata through this helper to keep canonical and social tags complete.
// Share image: the page's own share image, then `image` (for example an article's photo), then the site default.
export function pageMetadata({ settings, title, description, path, absoluteTitle = false, image, seo = {}, article }: {
  settings: SiteSettings;
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  image?: ShareImage;
  seo?: SeoControls;
  article?: { publishedTime: string; modifiedTime?: string; section?: string };
}): Metadata {
  const shareImage = seo.shareImage ? { url: seo.shareImage, alt: seo.shareImageAlt ?? "" } : image?.url ? image : settings.image;
  const canonical = seo.canonicalUrl || path;
  const fullTitle = absoluteTitle ? title : `${title} | ${settings.name}`;
  const shared = { siteName: settings.name, locale: site.locale, url: canonical, title: fullTitle, description, images: [shareImage] };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    // Replaces the layout's robots tags. Links are still followed so the rest of the site is found.
    ...(seo.noindex ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
    openGraph: article ? { ...shared, type: "article", ...article, authors: [settings.name] } : { ...shared, type: "website" },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [shareImage.url] },
  };
}

// Search snippets cut off around 160 characters; trim on a word boundary instead.
export function truncate(text: string, max = 160) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

// Fallback search titles and descriptions, used when an editor leaves the SEO fields empty.
// Shared by the website and the admin panel's Google preview so both always agree.
export const defaultPageTitles = {
  "about-us": "About Us",
  contact: "Contact Us",
  blogs: "Travel Blog",
  cars: "Self-Drive Cars for Rent in Guwahati",
} as const;

export const carSeoTitle = (name: string) => `Rent a ${name} in Guwahati`;

// Empty specs are left out, so a car without them still reads naturally.
export function carSeoDescription(car: { name: string; seats: string; fuel: string; transmission: string }) {
  const specs = [car.seats, car.fuel, car.transmission].map((spec) => spec.trim().toLowerCase()).filter(Boolean).join(", ");
  return `Rent a self-drive ${car.name} in Guwahati${specs ? ` (${specs})` : ""}, with doorstep and airport delivery for trips across Assam and the Northeast.`;
}
