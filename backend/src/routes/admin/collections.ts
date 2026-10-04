import { Router, type Request } from "express";
import { z } from "zod";
import { camelKeys, columns, snakeKeys } from "../../lib/case";
import { check, HttpError, notFound, requireAltText, unwrap, unwrapMaybe } from "../../lib/http";
import { db } from "../../lib/supabase";
import { adminOf } from "../../middleware/requireAdmin";
import { collections, isCollectionKey, type CollectionConfig, type CollectionKey } from "../../schemas/collections";
import { missingAltText, slugify, uuidParam } from "../../schemas/fields";
import { revalidate } from "../../services/revalidate";
import { getRevision, latestRevisionNumber, listDeleted, listRevisions, versionColumns } from "../../services/revisions";

// One set of routes serves every collection. Behaviour differs only through its config:
// tracked collections (blogs, testimonials) expose history and restore, the others simply overwrite.
export const adminCollections = Router({ mergeParams: true });

type Row = Record<string, unknown> & { id: string; slug?: string };

function configOf(req: Request): { key: CollectionKey; config: CollectionConfig } {
  const key = req.params.collection as string;
  if (!isCollectionKey(key)) throw notFound("Collection");
  return { key, config: collections[key] };
}

function requireTracked(config: CollectionConfig) {
  if (!config.tracked) throw new HttpError(404, `${config.label}s do not keep history.`);
}

// Tags for the pages that show this collection, e.g. "cars" and "cars:toyota-innova-crysta".
function refresh(key: CollectionKey, config: CollectionConfig, ...slugs: (string | undefined)[]) {
  const tag = config.publicPath ? config.publicPath.slice(1) : key;
  const distinct = [...new Set(slugs.filter((slug): slug is string => !!slug))];
  // A slug change adds a redirect from the old URL (database trigger), so the site's redirect list refreshes too.
  revalidate([tag, ...distinct.map((slug) => `${tag}:${slug}`), ...(config.publicPath && distinct.length > 1 ? ["redirects"] : [])]);
}

async function findRow(config: CollectionConfig, id: string) {
  const row = unwrapMaybe(await db.from(config.table).select("*").eq("id", id).maybeSingle()) as Row | null;
  if (!row) throw notFound(config.label);
  return row;
}

// Fills an empty slug from the title or name, as the admin form promises.
function withSlug(config: CollectionConfig, values: Record<string, unknown>) {
  if (!config.slugFrom || values.slug) return values;
  const source = values[config.slugFrom];
  const slug = typeof source === "string" ? slugify(source) : "";
  if (!slug) throw new HttpError(400, "Add a name so a URL slug can be created.");
  return { ...values, slug };
}

const out = (row: Record<string, unknown>) => camelKeys(row);

// Rejects switching a limited flag on when the maximum number of rows already have it.
async function checkLimitedFlag(config: CollectionConfig, values: Record<string, unknown>, id?: string) {
  const limit = config.limitedFlag;
  if (!limit || values[limit.field] !== true) return;
  let query = db.from(config.table).select("id", { count: "exact", head: true }).eq(columns([limit.field]), true);
  if (id) query = query.neq("id", id);
  const { count, error } = await query;
  check({ error });
  if ((count ?? 0) >= limit.max) throw new HttpError(409, limit.message);
}

adminCollections.get("/", async (req, res) => {
  const { config } = configOf(req);
  let query = db.from(config.table).select("*");
  for (const { column, ascending } of config.order) query = query.order(column, { ascending, nullsFirst: false });
  res.json({ items: unwrap(await query).map(out) });
});

adminCollections.post("/", async (req, res) => {
  const { key, config } = configOf(req);
  const values = withSlug(config, config.schema.parse(req.body));
  requireAltText(missingAltText(values));
  await checkLimitedFlag(config, values);
  const row = unwrap(await db.from(config.table).insert({ ...snakeKeys(values), updated_by: adminOf(req).id }).select("*").single()) as Row;
  refresh(key, config, row.slug);
  res.status(201).json(out(row));
});

// Sets display order from a list of ids, first id shown first.
adminCollections.put("/order", async (req, res) => {
  const { key, config } = configOf(req);
  if (!("position" in config.schema.shape)) throw new HttpError(400, `${config.label}s are ordered by date.`);
  const { ids } = z.object({ ids: z.array(z.uuid()).min(1).max(500) }).parse(req.body);
  const adminId = adminOf(req).id;
  for (const [position, id] of ids.entries()) {
    check(await db.from(config.table).update({ position, updated_by: adminId }).eq("id", id));
  }
  refresh(key, config);
  res.json({ ok: true });
});

// Tracked collections only: records that were deleted, with their final saved version.
adminCollections.get("/deleted", async (req, res) => {
  const { config } = configOf(req);
  requireTracked(config);
  res.json({ items: await listDeleted(config.table, config.table) });
});

adminCollections.get("/:id", async (req, res) => {
  const { config } = configOf(req);
  const { id } = uuidParam.parse(req.params);
  res.json(out(await findRow(config, id)));
});

// PUT replaces every editable field (what the admin form sends); PATCH changes only the fields
// sent, for quick actions such as archive or publish.
for (const method of ["put", "patch"] as const) {
  adminCollections[method]("/:id", async (req, res) => {
    const { key, config } = configOf(req);
    const { id } = uuidParam.parse(req.params);
    const existing = await findRow(config, id);
    const parsed = method === "put" ? withSlug(config, config.schema.parse(req.body)) : config.schema.partial().parse(req.body);
    // A partial update is checked together with the saved values, but only for the image fields it changes.
    requireAltText(method === "put" ? missingAltText(parsed) : missingAltText({ ...out(existing), ...parsed }, Object.keys(parsed)));
    await checkLimitedFlag(config, parsed, id);
    const changes = { ...snakeKeys(parsed), updated_by: adminOf(req).id };
    const row = unwrap(await db.from(config.table).update(changes).eq("id", id).select("*").single()) as Row;
    refresh(key, config, existing.slug, row.slug);
    res.json(out(row));
  });
}

// Tracked collections keep the deleted record's final version, so it can be restored later.
adminCollections.delete("/:id", async (req, res) => {
  const { key, config } = configOf(req);
  const { id } = uuidParam.parse(req.params);
  const existing = await findRow(config, id);
  // Record who deleted it: the trigger saves the row as last edited, so stamp the editor first.
  if (config.tracked) check(await db.from(config.table).update({ updated_by: adminOf(req).id }).eq("id", id));
  check(await db.from(config.table).delete().eq("id", id));
  refresh(key, config, existing.slug);
  res.status(204).end();
});

adminCollections.get("/:id/revisions", async (req, res) => {
  const { config } = configOf(req);
  requireTracked(config);
  const { id } = uuidParam.parse(req.params);
  res.json({ items: await listRevisions(config.table, id) });
});

// Restores an earlier version. The current version is saved as a new revision first, so a restore
// can itself be undone. Also brings back a deleted record from its final version.
adminCollections.post("/:id/revisions/:revision/restore", async (req, res) => {
  const { key, config } = configOf(req);
  requireTracked(config);
  const { id } = uuidParam.parse(req.params);
  const revision = z.coerce.number().int().min(1).parse(req.params.revision);
  const saved = await getRevision(config.table, id, revision);
  if (!saved) throw notFound("Version");

  const snapshot = saved.snapshot as Record<string, unknown>;
  const content = Object.fromEntries(Object.entries(snapshot).filter(([column]) => !versionColumns.includes(column)));
  const adminId = adminOf(req).id;
  const existing = unwrapMaybe(await db.from(config.table).select("id, slug").eq("id", id).maybeSingle()) as Row | null;

  const row = existing
    ? unwrap(await db.from(config.table).update({ ...content, updated_by: adminId }).eq("id", id).select("*").single()) as Row
    // Re-created with its original id so its history stays attached; numbering continues after the last version.
    : unwrap(await db.from(config.table).insert({
      ...content, id, created_at: snapshot.created_at, updated_by: adminId,
      revision: (await latestRevisionNumber(config.table, id)) + 1,
    }).select("*").single()) as Row;

  refresh(key, config, existing?.slug, row.slug);
  res.json(out(row));
});
