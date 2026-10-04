import type { JwtPayload } from "@supabase/supabase-js";

// Both values are public by design (the publishable key only works within row-level security).
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const adminRoot = "/adv-admin-panel";
export const loginPath = `${adminRoot}/login`;

// Admins are marked with app_metadata.role = "admin" in Supabase. Users cannot edit app_metadata,
// and it travels inside the signed access token, so this check needs no database lookup.
export const isAdmin = (claims: JwtPayload | null | undefined) =>
  (claims?.app_metadata as { role?: unknown } | undefined)?.role === "admin";

// Only same-site studio paths are accepted after login, so a crafted ?next= link cannot send
// someone to another website.
export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith(adminRoot) || value.startsWith("//") || value.startsWith(loginPath)) return adminRoot;
  return value;
}
