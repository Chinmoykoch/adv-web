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
  // Optional Google Business Profile connection. All credentials stay on the backend.
  GOOGLE_BUSINESS_CLIENT_ID: z.string().trim().default(""),
  GOOGLE_BUSINESS_CLIENT_SECRET: z.string().trim().default(""),
  GOOGLE_BUSINESS_REFRESH_TOKEN: z.string().trim().default(""),
  GOOGLE_BUSINESS_LOCATION: z.string().trim().refine((value) => !value || /^accounts\/[0-9]+\/locations\/[0-9]+$/.test(value), "Use accounts/ACCOUNT_ID/locations/LOCATION_ID").default(""),
  GOOGLE_BUSINESS_MAPS_URL: z.string().trim().refine((value) => !value || /^https:\/\/(maps\.app\.goo\.gl|www\.google\.[a-z.]+|maps\.google\.[a-z.]+)\//.test(value), "Use a Google Maps HTTPS link").default(""),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
