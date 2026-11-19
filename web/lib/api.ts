/**
 * api.ts - the ONE place where the website talks to the backend.
 * (Like a waiter: pages give it an order, it brings back the answer.)
 *
 * Usage:
 *   const health = await api<{ status: string }>("/health");
 *   await api("/reports", { method: "POST", body: { ... } });
 *
 * It always:
 *   - adds /api/v1 in front of the path,
 *   - sends and reads JSON,
 *   - adds the X-SafeZone: 1 safety header when data is being changed,
 *   - turns every problem into an ApiError with a code and a readable message.
 */

/** An error from the backend, in our standard shape. */
export class ApiError extends Error {
  code: string; // e.g. "not_found", "invalid_input", "backend_unreachable"
  status: number; // HTTP status number, 0 if the network failed
  fields: Record<string, string>; // which form fields were wrong

  constructor(code: string, message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown; // anything that can be turned into JSON
  signal?: AbortSignal; // lets a page cancel the request
};

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-SafeZone"] = "1"; // CSRF safety header

  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin", // send login cookies (used from Task 8)
      signal: options.signal,
    });
  } catch {
    // No answer at all: the internet is down or the website itself stopped.
    throw new ApiError("network", "Can't reach SafeZone. Check your internet connection.", 0);
  }

  // Read the answer as JSON (if it isn't JSON, data stays null).
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (data?.error) {
      throw new ApiError(data.error.code, data.error.message, response.status, data.error.fields ?? {});
    }
    // Not our error shape: the website could not reach the backend.
    throw new ApiError("backend_unreachable", "The SafeZone server is not responding.", response.status);
  }

  return data as T;
}
