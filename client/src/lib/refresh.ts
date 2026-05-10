import { BASE_URL } from "./base-url";
import { authEvents } from "./auth-events";
import { clearTokens, getRefreshToken, setRefreshToken, setToken } from "./auth";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let inFlight: Promise<string> | null = null;

// single-flight: concurrent 401s share one rotation, since refresh tokens are single-use server-side
export function refreshAccessToken(): Promise<string> {
  if (inFlight) return inFlight;
  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function run(): Promise<string> {
  const current = getRefreshToken();
  if (!current) {
    clearTokens();
    authEvents.emitSessionEnded();
    throw new Error("No refresh token");
  }

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current }),
  });

  if (!res.ok) {
    clearTokens();
    authEvents.emitSessionEnded();
    throw new Error("Refresh failed");
  }

  const data = (await res.json()) as RefreshResponse;
  setToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  return data.accessToken;
}
