import { z } from "zod";
import { HttpError } from "../lib/http";

export const pageKeys = ["home", "about-us", "contact", "blogs", "cars", "site-settings"] as const;
export type PageKey = (typeof pageKeys)[number];
const pageKeySchema = z.enum(pageKeys);

// An unknown page is a 404, not a validation error.
export function parsePageKey(value: unknown): PageKey {
  const result = pageKeySchema.safeParse(value);
  if (!result.success) throw new HttpError(404, "Page not found.");
  return result.data;
}

// A page is a flat set of text fields (headings, paragraphs, image paths, SEO fields).
// Saving replaces the whole set, so a field left out of the request is removed from the page.
export const pageContentSchema = z.record(
  z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{0,63}$/, "Field names are letters and numbers"),
  z.string().max(20_000),
).refine((content) => Object.keys(content).length <= 300, "Too many fields");

export const pageBodySchema = z.object({ content: pageContentSchema });
