import { camelKeys } from "../lib/case";
import { unwrap, unwrapMaybe } from "../lib/http";
import { db } from "../lib/supabase";

// Columns that describe a version rather than its content; never copied back on restore.
export const versionColumns = ["id", "revision", "created_at", "updated_at", "updated_by"];

const emailCache = new Map<string, string | null>();

// Shows who saved each version. Admin accounts are few, so lookups are cached for the process.
async function emailsFor(ids: (string | null)[]) {
  const unknown = [...new Set(ids.filter((id): id is string => !!id && !emailCache.has(id)))];
  await Promise.all(unknown.map(async (id) => {
    const { data } = await db.auth.admin.getUserById(id);
    emailCache.set(id, data.user?.email ?? null);
  }));
  return (id: string | null) => (id ? emailCache.get(id) ?? null : null);
}

export async function listRevisions(entity: string, rowId: string) {
  const rows = unwrap(await db.from("content_revisions")
    .select("revision, action, snapshot, saved_by, saved_at")
    .eq("entity", entity).eq("row_id", rowId)
    .order("revision", { ascending: false }));
  const email = await emailsFor(rows.map((row) => row.saved_by));
  return rows.map((row) => ({
    revision: row.revision,
    action: row.action,
    savedAt: row.saved_at,
    savedBy: email(row.saved_by),
    snapshot: camelKeys(row.snapshot),
  }));
}

export async function getRevision(entity: string, rowId: string, revision: number) {
  return unwrapMaybe(await db.from("content_revisions")
    .select("revision, action, snapshot")
    .eq("entity", entity).eq("row_id", rowId).eq("revision", revision)
    .maybeSingle());
}

// Rows of a tracked table that were deleted: their last saved version, newest first.
export async function listDeleted(entity: string, table: string) {
  const deleted = unwrap(await db.from("content_revisions")
    .select("row_id, revision, snapshot, saved_by, saved_at")
    .eq("entity", entity).eq("action", "delete")
    .order("saved_at", { ascending: false }));
  if (deleted.length === 0) return [];
  // A row restored after deletion exists again and is no longer listed.
  const alive = new Set(unwrap(await db.from(table).select("id").in("id", deleted.map((row) => row.row_id))).map((row: { id: string }) => row.id));
  const email = await emailsFor(deleted.map((row) => row.saved_by));
  return deleted.filter((row) => !alive.has(row.row_id)).map((row) => ({
    id: row.row_id,
    revision: row.revision,
    lastSavedAt: row.saved_at,
    lastSavedBy: email(row.saved_by),
    snapshot: camelKeys(row.snapshot),
  }));
}

export async function latestRevisionNumber(entity: string, rowId: string) {
  const row = unwrapMaybe(await db.from("content_revisions").select("revision").eq("entity", entity).eq("row_id", rowId)
    .order("revision", { ascending: false }).limit(1).maybeSingle());
  return row?.revision ?? 0;
}
