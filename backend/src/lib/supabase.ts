import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

// Uses the secret key, which bypasses row-level security. It must only ever run on the server.
export const db = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
