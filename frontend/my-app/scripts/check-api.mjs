// Runs before `next build` (the "prebuild" script). Every page is built from content served by the
// Express backend, so the build cannot succeed without it. This checks the backend first and stops
// with clear instructions, instead of failing halfway through with "fetch failed".
import nextEnv from "@next/env";

// Same .env files, in the same order, as `next build` itself (@next/env ships with Next.js).
nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });

const api = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const fail = (lines) => {
  console.error(`\n✖ Build stopped: ${lines.join("\n  ")}\n`);
  process.exit(1);
};

if (!api) fail(["API_URL (or NEXT_PUBLIC_API_URL) is not set.", "Add it to .env.local (development) or the server's environment (production)."]);

try {
  const response = await fetch(`${api}/health`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  console.log(`✓ Content API reachable at ${api}`);
} catch (error) {
  fail([
    `the content API at ${api} is not reachable (${error.cause?.code ?? error.message}).`,
    "The website is built from the database through the backend, so start it first:",
    "  cd backend && npm run dev      (development)",
    "  or make sure the deployed backend is running (production).",
  ]);
}
