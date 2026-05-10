import { getToken } from "./auth";
import { BASE_URL } from "./base-url";
import { refreshAccessToken } from "./refresh";

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const send = (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {};
    // Let the browser set the multipart boundary for FormData; only stamp JSON
    // content-type for plain object bodies.
    if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });
  };

  let res = await send(auth ? getToken() : null);

  // one-shot refresh-and-retry on 401 for authed calls
  if (res.status === 401 && auth) {
    try {
      const fresh = await refreshAccessToken();
      res = await send(fresh);
    } catch {
      // refresh failed — fall through and surface the original 401 below
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
