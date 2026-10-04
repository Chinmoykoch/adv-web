import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin, loginPath, safeNextPath, supabaseConfigured, supabasePublishableKey, supabaseUrl } from "./app/lib/supabase/config";

// Guards the admin studio. Runs before every /adv-admin-panel request to refresh the Supabase
// session cookie and send anyone without an admin session to the login page.
// This only protects the screens: the Express API verifies the token again on every request,
// so admin data stays safe even if this check is bypassed.
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) {
    return new NextResponse("Admin login is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.", { status: 503 });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getClaims verifies the token's signature against the project's published keys, so a
  // tampered or expired cookie is rejected. It also refreshes an expiring session.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const { pathname, search } = request.nextUrl;

  // Redirects keep any refreshed session cookies and no-cache headers from `response`.
  const redirectTo = (path: string, params: Record<string, string> = {}) => {
    const url = new URL(path, request.url);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response.headers.forEach((value, key) => { if (key !== "location" && key !== "content-type") redirect.headers.set(key, value); });
    return redirect;
  };

  if (pathname === loginPath) {
    // Already signed in as an admin: skip the form.
    return isAdmin(claims) ? redirectTo(safeNextPath(request.nextUrl.searchParams.get("next"))) : response;
  }

  if (!claims) return redirectTo(loginPath, { next: `${pathname}${search}` });

  if (!isAdmin(claims)) {
    // Signed in, but not an admin: end that session so the login form starts clean.
    await supabase.auth.signOut({ scope: "local" });
    return redirectTo(loginPath, { error: "not-admin" });
  }

  return response;
}

// Must be literal strings: Next reads the matcher at build time.
export const config = {
  matcher: ["/adv-admin-panel", "/adv-admin-panel/:path*"],
};
