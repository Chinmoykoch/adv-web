import { Router } from "express";
import { requireAltText, unwrap, unwrapMaybe } from "../../lib/http";
import { db } from "../../lib/supabase";
import { adminOf } from "../../middleware/requireAdmin";
import { missingAltText } from "../../schemas/fields";
import { pageBodySchema, pageKeys, parsePageKey } from "../../schemas/pages";
import { revalidate } from "../../services/revalidate";

// Pages keep only their current content: each save overwrites the page's single row.
export const adminPages = Router();

adminPages.get("/", async (_req, res) => {
  const rows = unwrap(await db.from("pages").select("key, updated_at"));
  const saved = new Map(rows.map((row) => [row.key, row.updated_at]));
  res.json({ items: pageKeys.map((key) => ({ key, updatedAt: saved.get(key) ?? null })) });
});

adminPages.get("/:key", async (req, res) => {
  const key = parsePageKey(req.params.key);
  const row = unwrapMaybe(await db.from("pages").select("content, updated_at").eq("key", key).maybeSingle());
  res.json({ key, content: row?.content ?? {}, updatedAt: row?.updated_at ?? null });
});

adminPages.put("/:key", async (req, res) => {
  const key = parsePageKey(req.params.key);
  const { content } = pageBodySchema.parse(req.body);
  requireAltText(missingAltText(content));
  // Upsert on the primary key: the existing row is replaced in place, never duplicated.
  const row = unwrap(await db.from("pages")
    .upsert({ key, content, updated_by: adminOf(req).id }, { onConflict: "key" })
    .select("content, updated_at")
    .single());
  // Site settings (site name, business details, default SEO) appear on every page.
  revalidate(key === "site-settings" ? ["site"] : [`pages:${key}`]);
  res.json({ key, content: row.content, updatedAt: row.updated_at });
});
