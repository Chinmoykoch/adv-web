import { z } from "zod";
import { env } from "../config/env";
import { HttpError, unwrapMaybe } from "../lib/http";
import { db } from "../lib/supabase";

export const MAX_FEATURED_GOOGLE_REVIEWS = 12;
export const reviewIdSchema = z.string().min(1).max(256).regex(/^[a-zA-Z0-9_-]+$/, "Invalid Google review ID");
const ratingValues = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as const;
const googleReviewSchema = z.object({
  reviewId: reviewIdSchema,
  reviewer: z.object({ displayName: z.string().optional(), isAnonymous: z.boolean().optional() }).optional(),
  starRating: z.enum(["ONE", "TWO", "THREE", "FOUR", "FIVE"]),
  comment: z.string().optional(),
  createTime: z.string().optional(),
  updateTime: z.string().optional(),
});
export type GoogleReview = { id: string; customerName: string; quote: string; rating: number; reviewedAt: string | null };

const credentialKeys = ["GOOGLE_BUSINESS_CLIENT_ID", "GOOGLE_BUSINESS_CLIENT_SECRET", "GOOGLE_BUSINESS_REFRESH_TOKEN", "GOOGLE_BUSINESS_LOCATION", "GOOGLE_BUSINESS_MAPS_URL"] as const;
export const googleReviewConfiguration = () => {
  const missing = credentialKeys.filter((key) => !env[key]);
  return { configured: missing.length === 0, missing, maxFeatured: MAX_FEATURED_GOOGLE_REVIEWS };
};

// Coalesce token refreshes so a batch of selected reviews needs only one OAuth request.
let token: { value: string; expiresAt: number } | null = null;
let tokenRequest: Promise<string> | null = null;
async function accessToken(): Promise<string> {
  if (!googleReviewConfiguration().configured) throw new HttpError(503, "Google reviews are not connected. Complete the backend connection settings first.");
  if (token && token.expiresAt > Date.now()) return token.value;
  if (tokenRequest) return tokenRequest;
  tokenRequest = (async () => {
    let response: Response;
    try {
      response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: env.GOOGLE_BUSINESS_CLIENT_ID, client_secret: env.GOOGLE_BUSINESS_CLIENT_SECRET, refresh_token: env.GOOGLE_BUSINESS_REFRESH_TOKEN, grant_type: "refresh_token" }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch { throw new HttpError(502, "Could not reach Google. Try again shortly."); }
    if (!response.ok) throw new HttpError(502, "Google authorization failed. Renew the Business Profile connection with the profile owner or manager account.");
    const parsed = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() }).safeParse(await response.json().catch(() => null));
    if (!parsed.success) throw new HttpError(502, "Google returned an unexpected authorization response.");
    token = { value: parsed.data.access_token, expiresAt: Date.now() + Math.max(0, parsed.data.expires_in - 60) * 1000 };
    return token.value;
  })();
  try { return await tokenRequest; } finally { tokenRequest = null; }
}

async function googleGet(path: string) {
  const authorization = await accessToken();
  let response: Response;
  try {
    response = await fetch(`https://mybusiness.googleapis.com/v4/${env.GOOGLE_BUSINESS_LOCATION}/reviews${path}`, {
      headers: { Authorization: `Bearer ${authorization}` }, signal: AbortSignal.timeout(10_000),
    });
  } catch { throw new HttpError(502, "Could not reach Google reviews. Try again shortly."); }
  if (response.status === 404) throw new HttpError(404, "This Google review or Business Profile location is no longer available.");
  if (response.status === 401) { token = null; throw new HttpError(502, "Google authorization expired. Refresh the reviews or renew the connection."); }
  if (response.status === 403) throw new HttpError(502, "Google denied review access. Check API approval, enabled APIs, the verified location, and the connected account's owner or manager access.");
  if (response.status === 429) throw new HttpError(503, "Google's review request limit was reached. Try again shortly.");
  if (!response.ok) throw new HttpError(502, "Google reviews are temporarily unavailable.");
  return response.json().catch(() => { throw new HttpError(502, "Google returned an unreadable review response."); });
}

function toReview(review: z.infer<typeof googleReviewSchema>): GoogleReview {
  return { id: review.reviewId, customerName: review.reviewer?.isAnonymous ? "Anonymous Google reviewer" : review.reviewer?.displayName || "Google reviewer", quote: review.comment ?? "", rating: ratingValues[review.starRating], reviewedAt: review.createTime ?? null };
}

export async function listGoogleReviews(pageToken = "") {
  const query = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
  if (pageToken) query.set("pageToken", pageToken);
  const result = z.object({ reviews: z.array(googleReviewSchema).default([]), nextPageToken: z.string().optional(), totalReviewCount: z.number().int().nonnegative().optional() }).safeParse(await googleGet(`?${query}`));
  if (!result.success) throw new HttpError(502, "Google returned an unexpected review response.");
  return { items: result.data.reviews.map(toReview), nextPageToken: result.data.nextPageToken ?? null, totalReviewCount: result.data.totalReviewCount ?? null };
}

export async function getGoogleReview(id: string) {
  const result = googleReviewSchema.safeParse(await googleGet(`/${encodeURIComponent(reviewIdSchema.parse(id))}`));
  if (!result.success || result.data.reviewId !== id) throw new HttpError(502, "Google returned an unexpected review response.");
  return toReview(result.data);
}

export async function selectedGoogleReviewIds(): Promise<string[]> {
  const row = unwrapMaybe(await db.from("google_review_selections").select("review_ids").eq("location_name", env.GOOGLE_BUSINESS_LOCATION).maybeSingle());
  return z.array(reviewIdSchema).max(MAX_FEATURED_GOOGLE_REVIEWS).parse(row?.review_ids ?? []);
}

// Only selected reviews get a short-lived performance cache. No review copies in Supabase.
const CACHE_MS = 5 * 60 * 1000;
let featuredCache: { items: ReturnType<typeof asTestimonial>[]; expiresAt: number } | null = null;
let featuredRequest: Promise<ReturnType<typeof asTestimonial>[]> | null = null;
let cacheExpiry: ReturnType<typeof setTimeout> | null = null;
let generation = 0;
export function clearFeaturedGoogleReviews() {
  generation++; featuredCache = null; featuredRequest = null;
  if (cacheExpiry) clearTimeout(cacheExpiry);
  cacheExpiry = null;
}
function asTestimonial(review: GoogleReview) {
  return { ...review, id: `google:${review.id}`, tripOrRole: null, source: "google" as const, sourceUrl: env.GOOGLE_BUSINESS_MAPS_URL };
}
export async function featuredGoogleReviews() {
  if (!googleReviewConfiguration().configured) return [];
  if (featuredCache && featuredCache.expiresAt > Date.now()) return featuredCache.items;
  if (featuredRequest) return featuredRequest;
  const version = generation;
  const request = (async () => {
    const ids = await selectedGoogleReviewIds();
    const results = await Promise.allSettled(ids.map(getGoogleReview));
    const items = results.flatMap((result) => result.status === "fulfilled" && result.value.quote.trim() ? [asTestimonial(result.value)] : []);
    if (version === generation) {
      featuredCache = { items, expiresAt: Date.now() + CACHE_MS };
      if (cacheExpiry) clearTimeout(cacheExpiry);
      cacheExpiry = setTimeout(() => { featuredCache = null; cacheExpiry = null; }, CACHE_MS);
      cacheExpiry.unref();
    }
    return items;
  })();
  featuredRequest = request;
  try { return await request; } finally { if (featuredRequest === request) featuredRequest = null; }
}
