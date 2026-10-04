import { env } from "../config/env";

// Tells the Next.js site which content changed so it rebuilds only the affected static pages.
// Tags look like "pages:home", "cars", "cars:toyota-innova-crysta".
// Fire-and-forget: a failed call must never fail the admin's save. The site also refreshes on
// a timer, so a missed call only delays the update.
export function revalidate(tags: string[]) {
  const unique = [...new Set(tags)];
  if (unique.length === 0) return;
  void Promise.allSettled(env.FRONTEND_URL.map(async (origin) => {
    const response = await fetch(`${origin}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.REVALIDATE_SECRET}` },
      body: JSON.stringify({ tags: unique }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  })).then((results) => {
    for (const result of results) if (result.status === "rejected") console.warn(`Page refresh failed for [${unique.join(", ")}]: ${result.reason instanceof Error ? result.reason.message : result.reason}`);
  });
}
