import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config/env";
import { check, HttpError } from "../../lib/http";
import { db } from "../../lib/supabase";
import { adminOf } from "../../middleware/requireAdmin";
import { clearFeaturedGoogleReviews, getGoogleReview, googleReviewConfiguration, listGoogleReviews, MAX_FEATURED_GOOGLE_REVIEWS, reviewIdSchema, selectedGoogleReviewIds } from "../../services/googleReviews";
import { revalidate } from "../../services/revalidate";

export const adminGoogleReviews = Router();
adminGoogleReviews.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
adminGoogleReviews.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many review requests. Wait a minute and try again." } }));

adminGoogleReviews.get("/status", async (_req, res) => {
  const config = googleReviewConfiguration();
  res.json({ ...config, selectedIds: config.configured ? await selectedGoogleReviewIds() : [] });
});

adminGoogleReviews.get("/", async (req, res) => {
  const { pageToken } = z.object({ pageToken: z.string().max(4096).default("") }).parse(req.query);
  res.json(await listGoogleReviews(pageToken));
});

// Atomic replacement preserves the chosen display order. Saving never edits Google reviews.
adminGoogleReviews.put("/selection", async (req, res) => {
  if (!googleReviewConfiguration().configured) throw new HttpError(503, "Connect Google Business Profile before selecting reviews.");
  const { ids } = z.object({ ids: z.array(reviewIdSchema).max(MAX_FEATURED_GOOGLE_REVIEWS).refine((ids) => new Set(ids).size === ids.length, "Choose each review only once") }).parse(req.body);
  const existing = await selectedGoogleReviewIds();
  // Validate only additions so removing an unavailable review still works during a Google outage.
  const added = await Promise.all(ids.filter((id) => !existing.includes(id)).map(getGoogleReview));
  if (added.some((review) => !review.quote.trim())) throw new HttpError(400, "Choose reviews that include written feedback for the testimonial section.");
  check(await db.from("google_review_selections").upsert({ location_name: env.GOOGLE_BUSINESS_LOCATION, review_ids: ids, updated_by: adminOf(req).id }));
  clearFeaturedGoogleReviews();
  revalidate(["testimonials"]);
  res.json({ selectedIds: ids });
});

adminGoogleReviews.post("/refresh", (_req, res) => {
  clearFeaturedGoogleReviews();
  revalidate(["testimonials"]);
  res.json({ ok: true });
});
