import { Router } from "express";
import { camelKeys, snakeKeys } from "../../lib/case";
import { check, notFound, unwrap, unwrapMaybe } from "../../lib/http";
import { db } from "../../lib/supabase";
import { adminOf } from "../../middleware/requireAdmin";
import { uuidParam } from "../../schemas/fields";
import { leadListQuery, leadStatuses, leadUpdateSchema } from "../../schemas/leads";
import { listRevisions } from "../../services/revisions";

// Leads are permanent: there is no delete route, and the database refuses deletes as well.
// Only status and admin notes can change, and every change is kept in content_revisions.
export const adminLeads = Router();

adminLeads.get("/", async (req, res) => {
  const { status, q, page, pageSize } = leadListQuery.parse(req.query);
  let query = db.from("leads").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (q) {
    // Characters with meaning in PostgREST filter syntax are dropped from the search text.
    const term = q.replace(/[,()*%\\]/g, " ").trim();
    if (term) query = query.or(["name", "phone", "email", "car_name"].map((column) => `${column}.ilike.*${term}*`).join(","));
  }
  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  const rows = unwrap({ data, error });
  res.json({ items: rows.map((row) => camelKeys(row)), total: count ?? 0, page, pageSize });
});

// Counts per status for the pipeline view.
adminLeads.get("/summary", async (_req, res) => {
  const counts = await Promise.all(leadStatuses.map(async (status) => {
    const { count, error } = await db.from("leads").select("id", { count: "exact", head: true }).eq("status", status);
    check({ error });
    return [status, count ?? 0] as const;
  }));
  res.json(Object.fromEntries(counts));
});

adminLeads.get("/:id", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const row = unwrapMaybe(await db.from("leads").select("*").eq("id", id).maybeSingle());
  if (!row) throw notFound("Lead");
  res.json({ ...camelKeys(row), history: await listRevisions("leads", id) });
});

adminLeads.patch("/:id", async (req, res) => {
  const { id } = uuidParam.parse(req.params);
  const changes = leadUpdateSchema.parse(req.body);
  const row = unwrapMaybe(await db.from("leads").update({ ...snakeKeys(changes), updated_by: adminOf(req).id }).eq("id", id).select("*").maybeSingle());
  if (!row) throw notFound("Lead");
  res.json(camelKeys(row));
});
