import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Any Supabase client (browser, server or service-role) can drive the services. */
export type DbClient = SupabaseClient<Database>;

/**
 * Thrown when PostgREST returns an error. Callers (Server Actions / UI) can
 * catch this and show `message` to the user.
 */
export class ServiceError extends Error {
  readonly code?: string;

  constructor(message: string, options?: { code?: string; cause?: unknown }) {
    super(message);
    this.name = "ServiceError";
    this.code = options?.code;
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

/** Unwrap a PostgREST result that must be present, throwing on error. */
export function unwrap<T>(result: {
  data: T;
  error: PostgrestError | null;
}): NonNullable<T> {
  if (result.error) {
    throw new ServiceError(result.error.message, {
      code: result.error.code,
      cause: result.error,
    });
  }
  return result.data as NonNullable<T>;
}

/** Unwrap a result that is allowed to be absent (e.g. `.maybeSingle()`). */
export function unwrapMaybe<T>(result: {
  data: T;
  error: PostgrestError | null;
}): T {
  if (result.error) {
    throw new ServiceError(result.error.message, {
      code: result.error.code,
      cause: result.error,
    });
  }
  return result.data;
}

/** Same as unwrap for statements that return no data. */
export function unwrapVoid(result: { error: PostgrestError | null }): void {
  if (result.error) {
    throw new ServiceError(result.error.message, {
      code: result.error.code,
      cause: result.error,
    });
  }
}

/** Convert form-style empty strings to null so optional columns stay clean. */
export function blankToNull<T extends string | undefined | null>(value: T): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
