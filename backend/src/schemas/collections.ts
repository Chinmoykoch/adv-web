import { z } from "zod";
import { imageUrl, isoDate, position, publishStatus, requiredText, seoControlColumns, seoControls, slug, text } from "./fields";

// One entry per admin collection. The schema describes what the admin panel may send
// (camelCase); keys map to snake_case columns of `table`.
export type CollectionConfig = {
  table: string;
  label: string;
  // Tracked tables keep every earlier version in content_revisions (see the migration).
  tracked: boolean;
  schema: z.ZodObject;
  // Field the slug is generated from when the editor leaves it empty.
  slugFrom?: string;
  // Public URL prefix for collections that have their own pages.
  publicPath?: "/blogs" | "/cars";
  // Columns returned by the public API. Internal fields (permission notes, editor ids) are never included.
  publicColumns: readonly string[];
  // Only published, non-archived rows are public when the table has a status column.
  hasStatus: boolean;
  // A yes/no field only a few rows may have switched on at once, such as the home page's 4 cars.
  limitedFlag?: { field: string; max: number; message: string };
  order: { column: string; ascending: boolean }[];
};

const base = { archived: z.boolean().optional() };

export const collections = {
  blogs: {
    table: "blog_posts",
    label: "Article",
    tracked: true,
    slugFrom: "title",
    publicPath: "/blogs",
    hasStatus: true,
    order: [{ column: "published_on", ascending: false }, { column: "created_at", ascending: false }],
    publicColumns: ["id", "slug", "title", "category", "publishedOn", "excerpt", "image", "imageAlt", "body", "seoTitle", "seoDescription", ...seoControlColumns, "createdAt", "updatedAt"],
    schema: z.object({
      ...base,
      slug: slug.optional(),
      title: requiredText(200),
      category: requiredText(80),
      publishedOn: isoDate,
      excerpt: text(500),
      image: imageUrl,
      imageAlt: text(250),
      body: requiredText(50_000),
      seoTitle: text(120),
      seoDescription: text(320),
      ...seoControls,
      status: publishStatus.optional(),
    }),
  },
  fleet: {
    table: "cars",
    label: "Vehicle",
    tracked: false,
    slugFrom: "name",
    publicPath: "/cars",
    hasStatus: true,
    limitedFlag: { field: "showOnHome", max: 4, message: "The home page shows 4 cars, and 4 are already chosen. Untick “Show on home page” on another car first." },
    order: [{ column: "position", ascending: true }, { column: "created_at", ascending: true }],
    publicColumns: ["id", "slug", "name", "categories", "badge", "featured", "description", "image", "imageAlt", "imagePosition", "fuel", "transmission", "seats", "showOnHome", "seoTitle", "seoDescription", ...seoControlColumns, "position", "updatedAt"],
    schema: z.object({
      ...base,
      slug: slug.optional(),
      name: requiredText(120),
      categories: z.array(z.enum(["SUV & 4x4", "Sedan", "MUV", "Luxury"])).max(4).optional(),
      badge: text(60),
      featured: z.boolean().optional(),
      showOnHome: z.boolean().optional(),
      description: text(1000),
      image: imageUrl,
      imageAlt: text(250),
      imagePosition: text(60),
      fuel: text(40),
      transmission: text(40),
      seats: text(40),
      seoTitle: text(120),
      seoDescription: text(320),
      ...seoControls,
      status: publishStatus.optional(),
      position,
    }),
  },
  services: {
    table: "services",
    label: "Service",
    tracked: false,
    hasStatus: false,
    order: [{ column: "position", ascending: true }, { column: "created_at", ascending: true }],
    publicColumns: ["id", "title", "label", "description", "image", "imageAlt", "featureBadge", "featureTitle", "featureDescription", "position"],
    schema: z.object({
      ...base,
      title: requiredText(120),
      label: text(60),
      description: requiredText(1000),
      image: imageUrl,
      imageAlt: text(250),
      featureBadge: text(60),
      featureTitle: text(160),
      featureDescription: text(600),
      position,
    }),
  },
  testimonials: {
    table: "testimonials",
    label: "Testimonial",
    tracked: true,
    hasStatus: false,
    order: [{ column: "position", ascending: true }, { column: "created_at", ascending: true }],
    publicColumns: ["id", "customerName", "tripOrRole", "quote", "rating", "image", "imageAlt", "position"],
    schema: z.object({
      ...base,
      customerName: requiredText(120),
      tripOrRole: text(160),
      quote: requiredText(2000),
      rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
      image: imageUrl,
      imageAlt: text(250),
      permissionNotes: text(1000),
      position,
    }),
  },
  "happy-customers": {
    table: "happy_customers",
    label: "Photo",
    tracked: false,
    hasStatus: false,
    order: [{ column: "position", ascending: true }, { column: "created_at", ascending: true }],
    publicColumns: ["id", "title", "category", "destination", "image", "imageAlt", "caption", "position"],
    schema: z.object({
      ...base,
      title: requiredText(160),
      category: text(80),
      destination: text(120),
      image: imageUrl,
      imageAlt: text(250),
      caption: text(1000),
      permissionNotes: text(1000),
      position,
    }),
  },
} satisfies Record<string, CollectionConfig>;

export type CollectionKey = keyof typeof collections;
export const collectionKeys = Object.keys(collections) as CollectionKey[];
export const isCollectionKey = (value: string): value is CollectionKey => Object.hasOwn(collections, value);
