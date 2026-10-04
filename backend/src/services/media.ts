import { createHash } from "node:crypto";
import sharp from "sharp";
import { HttpError } from "../lib/http";
import { db } from "../lib/supabase";
import { slugify } from "../schemas/fields";

export const MEDIA_BUCKET = "media";
// Wider than any layout on the site (hero images are full-bleed); larger photos are scaled down.
const MAX_WIDTH = 2400;
const MAX_HEIGHT = 2400;
// Visually indistinguishable from the original for photos, at a fraction of the size.
const WEBP_QUALITY = 82;
// Formats sharp can read reliably. Detected from the file's bytes, not its name or the browser's claim.
const ACCEPTED_INPUTS = new Set(["jpeg", "png", "webp", "avif", "tiff", "gif", "heif"]);

export type ProcessedImage = { data: Buffer; width: number; height: number };

// Converts any accepted image to WebP: honours the camera's rotation, scales it down to fit
// 2400 × 2400, and drops metadata (GPS location, camera details) for privacy and size.
export async function toWebp(input: Buffer): Promise<ProcessedImage> {
  let format: string | undefined;
  try {
    format = (await sharp(input).metadata()).format;
  } catch {
    throw new HttpError(400, "That file isn’t an image we can read. Use JPG, PNG, WebP or AVIF.");
  }
  if (!format || !ACCEPTED_INPUTS.has(format)) throw new HttpError(400, "That file isn’t an image we can read. Use JPG, PNG, WebP or AVIF.");

  const { data, info } = await sharp(input, { animated: false, limitInputPixels: 100_000_000 })
    .rotate()
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// media/<folder>/<year>/<month>/<content hash>-<readable name>.webp
// The hash makes every distinct image a new file (never overwritten, so it can be cached forever)
// and means uploading the same image twice reuses the existing file.
export function storagePath(folder: string, name: string, data: Buffer, date = new Date()) {
  const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
  const readable = slugify(name.replace(/\.[a-z0-9]+$/i, "")).slice(0, 60) || "image";
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${folder}/${date.getUTCFullYear()}/${month}/${hash}-${readable}.webp`;
}

export const publicUrl = (path: string) => db.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

export async function uploadWebp(path: string, image: ProcessedImage) {
  const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, image.data, {
    contentType: "image/webp",
    // One year: safe because a changed image always gets a new file name.
    cacheControl: "31536000",
    upsert: false,
  });
  // Same hash means identical bytes, so an existing file is exactly what we wanted to upload.
  if (error && !/exists|duplicate/i.test(error.message)) throw new HttpError(502, "The image could not be stored. Try again.", error.message);
  return { path, url: publicUrl(path), width: image.width, height: image.height, bytes: image.data.length };
}
