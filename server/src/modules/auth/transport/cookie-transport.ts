import type { Request, Response } from "express";
import type { ITokenTransport, TokenPair } from "@/modules/auth/transport/token-transport";

// stub for the eventual swap to httponly cookie + csrf — not wired today
class CookieTransport implements ITokenTransport {
  sendPair(_res: Response, _pair: TokenPair, _body?: Record<string, unknown>): void {
    throw new Error("cookie transport not yet implemented");
  }
  sendAccess(_res: Response, _accessToken: string, _refreshToken: string): void {
    throw new Error("cookie transport not yet implemented");
  }
  readRefresh(_req: Request): string | null {
    throw new Error("cookie transport not yet implemented");
  }
  clearRefresh(_res: Response): void {
    throw new Error("cookie transport not yet implemented");
  }
}

export const cookieTransport: ITokenTransport = new CookieTransport();
