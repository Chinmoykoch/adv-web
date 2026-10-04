import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { HttpError } from "../lib/http";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Not found."));
}

// Express 5 forwards errors from async handlers here automatically.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    const fields = Object.fromEntries(error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]));
    return res.status(400).json({ error: "Some fields need attention.", fields });
  }
  // Malformed JSON bodies and bodies over the size limit, from express.json().
  const status = typeof (error as { status?: unknown })?.status === "number" ? (error as { status: number }).status : undefined;
  if (error instanceof HttpError || (status && status < 500)) {
    const httpError = error as HttpError;
    if (httpError.status >= 500) console.error(error);
    return res.status(httpError.status).json({
      error: error instanceof HttpError ? error.message : "The request could not be read.",
      ...(error instanceof HttpError && error.fields ? { fields: error.fields } : {}),
      ...(env.NODE_ENV !== "production" && error instanceof HttpError && error.details ? { details: error.details } : {}),
    });
  }
  console.error(error);
  res.status(500).json({ error: "Something went wrong. Try again in a moment." });
}
