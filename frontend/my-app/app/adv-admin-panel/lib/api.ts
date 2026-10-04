"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { loginPath } from "../../lib/supabase/config";

export const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

// The current access token. getSession refreshes it first if it is about to expire.
async function accessToken() {
  const { data } = await getSupabaseBrowserClient().auth.getSession();
  if (!data.session) throw new ApiError(401, "Your session has ended. Sign in again.");
  return data.session.access_token;
}

async function errorFrom(status: number, body: unknown) {
  const { error, fields } = (body ?? {}) as { error?: string; fields?: Record<string, string> };
  return new ApiError(status, error ?? `Request failed (${status}).`, fields);
}

// JSON request to the admin API with the signed-in user's token.
export async function apiRequest<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  if (!apiUrl) throw new ApiError(0, "The admin API isn’t configured: set NEXT_PUBLIC_API_URL.");
  const token = await accessToken();
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${token}`, ...(init.body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "Couldn’t reach the server. Check your connection and that the backend is running.");
  }
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  // Expired or revoked session: back to the login page, then return here afterwards.
  if (response.status === 401 && typeof window !== "undefined") {
    // A full page load (not router.push) so proxy.ts re-checks the session; this helper runs outside React.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${loginPath}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }
  if (!response.ok) throw await errorFrom(response.status, body);
  return body as T;
}

export type UploadedImage ={ url: string; path: string; width: number; height: number; bytes: number };

// Sends an image to the backend, which converts it to WebP and stores it in Supabase Storage.
// Uses XMLHttpRequest because fetch cannot report upload progress.
export async function uploadImage(file: File, options: { folder: string; name?: string; onProgress?: (percent: number) => void }) {
  if (!apiUrl) throw new ApiError(0, "Uploads aren’t configured: set NEXT_PUBLIC_API_URL.");
  const token = await accessToken();
  const form = new FormData();
  form.append("folder", options.folder);
  if (options.name) form.append("name", options.name);
  form.append("file", file);

  return new Promise<UploadedImage>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${apiUrl}/api/admin/uploads`);
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.responseType = "json";
    request.upload.onprogress = (event) => { if (event.lengthComputable) options.onProgress?.(Math.round((event.loaded / event.total) * 100)); };
    request.onload = async () => {
      if (request.status >= 200 && request.status < 300) resolve(request.response as UploadedImage);
      else reject(await errorFrom(request.status, request.response));
    };
    request.onerror = () => reject(new ApiError(0, "Couldn’t reach the server. Check your connection and that the backend is running."));
    request.send(form);
  });
}

export const errorMessage = (issue: unknown, fallback = "Something went wrong. Try again.") => (issue instanceof Error ? issue.message : fallback);

// Loads `path` from the admin API. `reload` refetches; `setData` applies a local change
// (for example after a save) without waiting for a refetch.
export function useApi<T>(path: string) {
  const [state, setState] = useState<{ path: string; data?: T; error?: string }>({ path });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let active = true;
    apiRequest<T>(path).then(
      (data) => { if (active) setState({ path, data }); },
      (issue) => { if (active) setState({ path, error: errorMessage(issue, "Couldn’t load this content.") }); },
    );
    return () => { active = false; };
  }, [path, nonce]);
  // Data from a previous path is never shown for a new one.
  const current = state.path === path ? state : { path };
  return {
    data: current.data,
    error: current.error,
    loading: current.data === undefined && current.error === undefined,
    reload: useCallback(() => setNonce((value) => value + 1), []),
    setData: useCallback((data: T) => setState({ path, data }), [path]),
  };
}
