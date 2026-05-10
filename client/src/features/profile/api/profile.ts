import type { AuthUser, UpdateMeInput } from "@hackathon/shared";
import { api } from "@/lib/api";

export async function getProfile(): Promise<AuthUser> {
  return api<AuthUser>("/api/auth/me");
}

export async function updateProfile(input: UpdateMeInput): Promise<AuthUser> {
  return api<AuthUser>("/api/auth/me", { method: "PATCH", body: input });
}

export async function deleteAccount(): Promise<void> {
  return api<void>("/api/auth/me", { method: "DELETE" });
}
