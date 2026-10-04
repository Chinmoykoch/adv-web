import type { PostgrestError } from "@supabase/supabase-js";

export class HttpError extends Error {
  // `fields` maps field names to messages, shown next to the matching admin form fields.
  constructor(public status: number, message: string, public details?: unknown, public fields?: Record<string, string>) {
    super(message);
  }
}

// 400 with per-field messages, in the same shape as a validation error.
export function requireAltText(missing: Record<string, string>) {
  if (Object.keys(missing).length) throw new HttpError(400, "Some fields need attention.", undefined, missing);
}

export const notFound = (what: string) => new HttpError(404, `${what} not found.`);

// Turns database errors into messages an editor can act on. Codes are Postgres SQLSTATEs.
export function fromDbError(error: PostgrestError): HttpError {
  if (error.code === "23505") {
    const field = /\((\w+)\)=/.exec(error.details ?? "")?.[1];
    return new HttpError(409, field === "slug" ? "That URL slug is already used. Choose a different one." : "That value is already used.");
  }
  if (error.code === "23514" || error.code === "23502" || error.code === "22P02" || error.code === "22007") return new HttpError(400, "Some values are not valid.", error.message);
  if (error.code === "23503") return new HttpError(400, "A linked record does not exist.");
  // Raised by the leads_prevent_delete trigger and other deliberate database guards.
  if (error.code === "P0001") return new HttpError(409, error.message);
  return new HttpError(500, "Database request failed.", error.message);
}

// Typed by the whole Supabase result (a success | failure union) so the row type survives.
type DbResult = { data: unknown; error: PostgrestError | null };

// Throws a friendly HttpError if the query failed. For writes that return no data.
export function check(result: { error: PostgrestError | null }) {
  if (result.error) throw fromDbError(result.error);
}

// For queries that always return data: lists, and .single() after insert/update.
export function unwrap<R extends DbResult>(result: R): NonNullable<R["data"]> {
  check(result);
  if (result.data === null || result.data === undefined) throw new HttpError(500, "Database returned no data.");
  return result.data as NonNullable<R["data"]>;
}

// For .maybeSingle() lookups, where "not found" is a normal outcome.
export function unwrapMaybe<R extends DbResult>(result: R): R["data"] | null {
  check(result);
  return result.data;
}
