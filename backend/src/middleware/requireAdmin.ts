import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env";
import { HttpError } from "../lib/http";

// Supabase's public signing keys. jose caches them and refetches only when an unknown key id
// appears (for example after a key rotation), so verification normally needs no network call.
const jwks = createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL));
const issuer = `${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1`;

export type AdminUser = { id: string; email?: string };

declare module "express-serve-static-core" {
  interface Request {
    admin?: AdminUser;
  }
}

// Allows the request only with a valid, unexpired Supabase access token whose app_metadata.role
// is "admin". The role is set with SQL and cannot be changed by the user.
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = /^Bearer (.+)$/i.exec(req.get("authorization") ?? "")?.[1];
  if (!token) return next(new HttpError(401, "Sign in to continue."));

  let payload;
  try {
    ({ payload } = await jwtVerify(token, jwks, { issuer, audience: "authenticated" }));
  } catch {
    return next(new HttpError(401, "Your session has expired. Sign in again."));
  }

  const role = (payload.app_metadata as { role?: unknown } | undefined)?.role;
  if (role !== "admin" || typeof payload.sub !== "string") return next(new HttpError(403, "This account doesn’t have admin access."));

  req.admin = { id: payload.sub, email: typeof payload.email === "string" ? payload.email : undefined };
  next();
}

// For handlers mounted behind requireAdmin.
export function adminOf(req: Request): AdminUser {
  if (!req.admin) throw new HttpError(401, "Sign in to continue.");
  return req.admin;
}
