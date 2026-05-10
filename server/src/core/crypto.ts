import { randomBytes, createHash } from "node:crypto";

// 32 bytes = 256 bits, hex-encoded for url safety
export function randomToken(): string {
  return randomBytes(32).toString("hex");
}

// only short-lived single-use tokens use this — bcrypt would be overkill
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
