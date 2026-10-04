import { Router, type Request } from "express";
import { rateLimit } from "express-rate-limit";
import { camelKeys, columns, snakeKeys } from "../lib/case";
import { check, notFound, unwrap, unwrapMaybe } from "../lib/http";
import { db } from "../lib/supabase";
import { collections, isCollectionKey, type CollectionConfig } from "../schemas/collections";
import { slug } from "../schemas/fields";
import { leadSubmissionSchema } from "../schemas/leads";
import { parsePageKey } from "../schemas/pages";

// Read-only content for the website, plus the enquiry form. Only published, non-archived
// records are returned, and only the columns the website needs.
export const publicRoutes = Router();

function collectionOf(req: Request): CollectionConfig {
  const key = req.params.collection as string;
  if (!isCollectionKey(key)) throw notFound("Collection");
  return collections[key];
}

publicRoutes.get("/pages/:key", async (req, res) => {
  const key = parsePageKey(req.params.key);
  const row = unwrapMaybe(await db.from("pages").select("content, updated_at").eq("key", key).maybeSingle());
  res.json({ key, content: row?.content ?? {}, updatedAt: row?.updated_at ?? null });
});

publicRoutes.get("/redirects", async (_req, res) => {
  const rows = unwrap(await db.from("redirects").select("from_path, to_path"));
  res.json({ items: rows.map((row) => camelKeys(row)) });
});

publicRoutes.get("/collections/:collection", async (req, res) => {
  const config = collectionOf(req);
  let query = db.from(config.table).select(columns(config.publicColumns)).eq("archived", false);
  if (config.hasStatus) query = query.eq("status", "published");
  for (const { column, ascending } of config.order) query = query.order(column, { ascending, nullsFirst: false });
  const rows = unwrap(await query) as unknown as Record<string, unknown>[];
  res.json({ items: rows.map((row) => camelKeys(row)) });
});

publicRoutes.get("/collections/:collection/:slug", async (req, res) => {
  const config = collectionOf(req);
  if (!config.publicPath) throw notFound("Page");
  const value = slug.safeParse(req.params.slug);
  if (!value.success) throw notFound(config.label);
  let query = db.from(config.table).select(columns(config.publicColumns)).eq("slug", value.data).eq("archived", false);
  if (config.hasStatus) query = query.eq("status", "published");
  const row = unwrapMaybe(await query.maybeSingle()) as Record<string, unknown> | null;
  if (!row) throw notFound(config.label);
  res.json(camelKeys(row));
});

// Enquiry form. Limited per visitor IP to slow down spam without blocking real customers.
const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many enquiries from this connection. Please try again in a few minutes, or call us." },
});

publicRoutes.post("/leads", leadLimiter, async (req, res) => {
  const { website, carId, ...lead } = leadSubmissionSchema.parse(req.body);
  // Bots fill the hidden honeypot field. Pretend success so they don't retry.
  if (website) return res.status(201).json({ ok: true });

  // The car's name is copied in so the lead still reads correctly if the car is renamed later.
  let car: { id: string; name: string } | null = null;
  if (carId) car = unwrapMaybe(await db.from("cars").select("id, name").eq("id", carId).maybeSingle());

  check(await db.from("leads").insert({
    ...snakeKeys({ ...lead, extra: lead.extra ?? {} }),
    car_id: car?.id ?? null,
    car_name: car?.name ?? null,
  }));
  res.status(201).json({ ok: true });
});
