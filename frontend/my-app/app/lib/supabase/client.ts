"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

let client: SupabaseClient | undefined;

// One client per browser tab. The session is kept in cookies so proxy.ts can read it.
export function getSupabaseBrowserClient() {
  client ??= createBrowserClient(supabaseUrl, supabasePublishableKey);
  return client;
}
