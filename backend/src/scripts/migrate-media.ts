// One-time move of the website's local images (frontend/my-app/public) into Supabase Storage.
// Finds every image the database points to with a local path such as "/car1.png", converts it
// to WebP, uploads it, and replaces the path with the Storage URL.
//
//   npm run media:migrate            preview only: shows what would change
//   npm run media:migrate -- --apply do it
//
// Safe to repeat: identical images get the same file name, and rows already pointing at
// Storage are skipped. The files in /public are left in place (old history versions may use them).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { check, unwrap } from "../lib/http";
import { db } from "../lib/supabase";
import { storagePath, toWebp, uploadWebp } from "../services/media";

const PUBLIC_DIR = path.resolve(__dirname, "../../../frontend/my-app/public");
const apply = process.argv.includes("--apply");
const isLocal = (value: unknown): value is string => typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
// Image fields in page content end in "image" (image, aboutImage, shareImage...), but not "imageAlt".
const isImageKey = (key: string) => /image$/i.test(key);
const tables = ["blog_posts", "cars", "services", "testimonials", "happy_customers"];

const uploaded = new Map<string, string>();
async function urlFor(localPath: string) {
  const cached = uploaded.get(localPath);
  if (cached) return cached;
  const file = path.resolve(PUBLIC_DIR, `.${decodeURI(localPath.split(/[?#]/)[0])}`);
  if (!file.startsWith(PUBLIC_DIR + path.sep)) throw new Error(`${localPath} is outside the public folder`);
  const original = await readFile(file);
  const image = await toWebp(original);
  const target = storagePath("site", path.basename(file), image.data);
  let url = `(preview) ${target}`;
  if (apply) url = (await uploadWebp(target, image)).url;
  console.log(`  ${localPath.padEnd(16)} ${(original.length / 1024).toFixed(0).padStart(5)} KB -> ${(image.data.length / 1024).toFixed(0).padStart(4)} KB WebP  ${image.width}x${image.height}  ${target}`);
  uploaded.set(localPath, url);
  return url;
}

async function main() {
  console.log(apply ? "Moving images to Supabase Storage...\n" : "PREVIEW: nothing will change. Run with --apply to move the images.\n");
  console.log("Images:");
  const updates: { describe: string; run: () => Promise<void> }[] = [];

  for (const page of unwrap(await db.from("pages").select("key, content"))) {
    const content = page.content as Record<string, string>;
    const changed: Record<string, string> = {};
    for (const [key, value] of Object.entries(content)) if (isImageKey(key) && isLocal(value)) changed[key] = await urlFor(value);
    if (Object.keys(changed).length === 0) continue;
    updates.push({
      describe: `pages/${page.key}: ${Object.keys(changed).join(", ")}`,
      // Same overwrite as an admin save, with only the image fields changed.
      run: async () => check(await db.from("pages").update({ content: { ...content, ...changed } }).eq("key", page.key)),
    });
  }

  for (const table of tables) {
    for (const row of unwrap(await db.from(table).select("id, image").like("image", "/%")) as { id: string; image: string }[]) {
      if (!isLocal(row.image)) continue;
      const url = await urlFor(row.image);
      updates.push({ describe: `${table}/${row.id.slice(0, 8)}: ${row.image}`, run: async () => check(await db.from(table).update({ image: url }).eq("id", row.id)) });
    }
  }

  console.log(`\nDatabase fields pointing at local images: ${updates.length}`);
  for (const update of updates) {
    console.log(`  ${update.describe}`);
    if (apply) await update.run();
  }
  console.log(apply ? `\nDone: ${uploaded.size} images in Storage, ${updates.length} database records updated.` : "\nPreview complete. Run `npm run media:migrate -- --apply` to apply.");
}

main().catch((error) => {
  console.error("Image move failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
