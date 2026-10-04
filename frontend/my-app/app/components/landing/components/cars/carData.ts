import type { SeoControls } from "../../../../lib/site";

export const categories = ["All", "SUV & 4x4", "Sedan", "MUV", "Luxury"] as const;

export type Category = (typeof categories)[number];

export type Car = SeoControls & {
  // Database id; present for cars loaded from the API (used to link enquiries to a car).
  id?: string;
  // URL segment for /cars/[slug]. Changing it changes the public URL, so keep it stable once published.
  slug: string;
  name: string;
  badge: string;
  featuredBadge?: boolean;
  // Chosen in the admin panel for the home page's "Curated Garage" section.
  showOnHome?: boolean;
  image: string;
  imageAlt: string;
  // CSS object-position for the photo, e.g. "40% 60%". The starter data below still uses the
  // original Tailwind classes; queries.ts converts those when they come back from the database.
  imagePosition: string;
  categories: Exclude<Category, "All">[];
  // Every car lists the same three specs, in the same order, so the cards line up.
  fuel: string;
  transmission: string;
  seats: string;
  description: string;
  // Optional search overrides; generated from the name and specs when empty.
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
};

// Starter fleet: the seed data for Supabase. The website reads the fleet from the database.
export const cars: Car[] = [
  {
    slug: "toyota-innova-crysta",
    name: "Toyota Innova Crysta",
    badge: "MUV · 7 Seater",
    image: "/car3.png",
    imageAlt: "White MPV parked outside a modern villa at sunset",
    imagePosition: "object-[40%_60%]",
    categories: ["MUV"],
    fuel: "Diesel",
    transmission: "Automatic",
    seats: "7 Seats",
    description: "A roomy seven-seater for family holidays and group trips, with space for luggage on longer drives across Assam and the Northeast.",
  },
  {
    slug: "mercedes-benz-e-class",
    name: "Mercedes-Benz E-Class",
    badge: "Executive Sedan",
    image: "/car1.png",
    imageAlt: "Black luxury sedan on a winding road through a pine forest",
    imagePosition: "object-[45%_60%]",
    categories: ["Sedan", "Luxury"],
    fuel: "Petrol",
    transmission: "Automatic",
    seats: "5 Seats",
    description: "An executive sedan for business travel, airport transfers, and occasions where a comfortable, refined cabin matters.",
  },
  {
    slug: "land-rover-defender",
    name: "Land Rover Defender",
    badge: "Expedition King",
    featuredBadge: true,
    image: "/car2.png",
    imageAlt: "SUV with a roof tent on a gravel mountain track",
    imagePosition: "object-[70%_60%]",
    categories: ["SUV & 4x4"],
    fuel: "Diesel",
    transmission: "Automatic",
    seats: "5/7 Seats",
    description: "A capable 4x4 for hill roads and outstation expeditions, with room for five or seven travellers and their gear.",
  },
  {
    slug: "range-rover-sport",
    name: "Range Rover Sport",
    badge: "Ultra Luxury SUV",
    // Placeholder photo until a Range Rover Sport image is added to /public.
    image: "/banner3.png",
    imageAlt: "SUV overlooking a river valley and green hills at sunset",
    imagePosition: "object-[30%_70%]",
    categories: ["SUV & 4x4", "Luxury"],
    fuel: "Diesel",
    transmission: "Automatic",
    seats: "5 Seats",
    description: "A luxury SUV that pairs a quiet, comfortable cabin with the confidence of a high-riding four-wheel drive.",
  },
];
