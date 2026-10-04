import { z } from "zod";

// Optional text: trimmed, and an empty string is stored as null.
export const text = (max = 500) =>
  z.string().trim().max(max).transform((value) => (value === "" ? null : value)).nullable().optional();
export const requiredText = (max = 200) => z.string().trim().min(1, "Required").max(max);

// Image fields and canonical links accept a site path (/car1.png) or an https URL, the same rule as the admin form.
export const pathOrHttps = text(1000).refine((value) => !value || /^(\/(?!\/)|https:\/\/)/i.test(value), "Must start with / or https://");
export const imageUrl = pathOrHttps;

// Search controls shared by every collection with its own public page (articles and cars).
export const seoControls = {
  noindex: z.boolean().optional(),
  canonicalUrl: pathOrHttps,
  shareImage: imageUrl,
  shareImageAlt: text(250),
};
export const seoControlColumns = ["noindex", "canonicalUrl", "shareImage", "shareImageAlt"] as const;

// Every image needs a description (alt text) for screen readers and Google Images. Image fields end
// in "image" (image, shareImage, slide2Image) and their description is the same key plus "Alt".
// `only` limits the check to the fields a partial update touches, so archiving an older entry still works.
export function missingAltText(values: Record<string, unknown>, only?: string[]) {
  const filled = (value: unknown) => typeof value === "string" && value.trim() !== "";
  const missing: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    const alt = `${key}Alt`;
    if (!/image$/i.test(key) || !filled(value) || filled(values[alt])) continue;
    if (only && !only.includes(key) && !only.includes(alt)) continue;
    missing[alt] = "Add a description of the image (alt text).";
  }
  return missing;
}

export const slug = z.string().trim().toLowerCase().max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens, for example: toyota-innova-crysta");

export const publishStatus = z.enum(["draft", "published"]);
export const isoDate = z.iso.date().nullable().optional();
export const position = z.coerce.number().int().min(0).optional();

export const slugify = (value: string) =>
  value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export const uuidParam = z.object({ id: z.uuid("Not a valid id") });
