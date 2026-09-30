export const categories = ["All", "SUV & 4x4", "Sedan", "MUV", "Luxury"] as const;

export type Category = (typeof categories)[number];

export type Car = {
  name: string;
  badge: string;
  featuredBadge?: boolean;
  image: string;
  imagePosition: string;
  categories: Exclude<Category, "All">[];
  // Every car lists the same three specs, in the same order, so the cards line up.
  fuel: string;
  transmission: string;
  seats: string;
  pricePerDay: number;
};

export const cars: Car[] = [
  {
    name: "Toyota Innova Crysta",
    badge: "MUV · 7 Seater",
    image: "/car3.png",
    imagePosition: "object-[40%_60%]",
    categories: ["MUV"],
    fuel: "Diesel",
    transmission: "Automatic",
    seats: "7 Seats",
    pricePerDay: 4500,
  },
  {
    name: "Mercedes-Benz E-Class",
    badge: "Executive Sedan",
    image: "/car1.png",
    imagePosition: "object-[45%_60%]",
    categories: ["Sedan", "Luxury"],
    fuel: "Petrol",
    transmission: "Automatic",
    seats: "5 Seats",
    pricePerDay: 12000,
  },
  {
    name: "Land Rover Defender",
    badge: "Expedition King",
    featuredBadge: true,
    image: "/car2.png",
    imagePosition: "object-[70%_60%]",
    categories: ["SUV & 4x4"],
    fuel: "Diesel",
    transmission: "Automatic",
    seats: "5/7 Seats",
    pricePerDay: 18000,
  },
  {
    name: "Range Rover Sport",
    badge: "Ultra Luxury SUV",
    // Placeholder photo until a Range Rover Sport image is added to /public.
    image: "/banner3.png",
    imagePosition: "object-[30%_70%]",
    categories: ["SUV & 4x4", "Luxury"],
    fuel: "Diesel",
    transmission: "Automatic",
    seats: "5 Seats",
    pricePerDay: 22000,
  },
];
