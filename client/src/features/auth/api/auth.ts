import type { AuthUser, LoginInput } from "@hackathon/shared";
import { api } from "@/lib/api";
import { BASE_URL } from "@/lib/base-url";

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export function login(input: LoginInput): Promise<LoginResponse> {
  return api<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function me(): Promise<AuthUser> {
  return api<AuthUser>("/api/auth/me");
}

export function logout(refreshToken: string): Promise<void> {
  return api<void>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}

export function forgotPassword(email: string): Promise<void> {
  return api<void>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export function resetPassword(token: string, newPassword: string): Promise<void> {
  return api<void>("/api/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    auth: false,
  });
}

// register is a multipart endpoint — bypass the json wrapper
export async function register(formData: FormData): Promise<{ user: AuthUser }> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? "Registration failed");
  }
  return res.json();
}
