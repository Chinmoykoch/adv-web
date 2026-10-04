import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

// Called by the backend after an admin saves, with the tags of the content that changed
// (for example ["cars", "cars:toyota-innova-crysta"]). Only that cached data is marked stale,
// so the affected pages rebuild on their next visit and the rest of the site stays cached.
const secret = process.env.REVALIDATE_SECRET ?? "";
const TAG = /^[a-z0-9-]+(:[a-z0-9-]+)?$/;

function authorized(header: string | null) {
  const token = /^Bearer (.+)$/.exec(header ?? "")?.[1] ?? "";
  // Constant-time comparison, so the secret can't be guessed from response timing.
  return secret.length >= 32 && token.length === secret.length && timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string" && TAG.test(tag)).slice(0, 50) : [];
  if (tags.length === 0) return Response.json({ error: "No valid tags" }, { status: 400 });

  // expire: 0 so the next visitor gets the new content immediately, not one more stale copy.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags, at: new Date().toISOString() });
}
