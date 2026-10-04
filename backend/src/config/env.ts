import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

// Every setting the server needs, checked once at startup so a missing key fails loudly
// instead of surfacing later as a confusing request error.
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(20, "SUPABASE_SECRET_KEY is missing"),
  SUPABASE_JWKS_URL: z.url(),
  // Comma-separated list of origins allowed to call the API from a browser.
  FRONTEND_URL: z.string().min(1).transform((value) => value.split(",").map((origin) => origin.trim().replace(/\/+$/, ""))),
  REVALIDATE_SECRET: z.string().min(32, "REVALIDATE_SECRET must be at least 32 characters"),
  // Number of reverse proxies in front of the server (Render, Railway, Nginx...), so rate limits see the real visitor IP.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
