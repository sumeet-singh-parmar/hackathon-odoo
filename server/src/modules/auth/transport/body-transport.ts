import type { Request, Response } from "express";
import type { ITokenTransport, TokenPair } from "@/modules/auth/transport/token-transport";

class BodyTransport implements ITokenTransport {
  sendPair(res: Response, pair: TokenPair, body?: Record<string, unknown>): void {
    res.json({ ...(body ?? {}), ...pair });
  }

  sendAccess(res: Response, accessToken: string, refreshToken: string): void {
    res.json({ accessToken, refreshToken });
  }

  readRefresh(req: Request): string | null {
    const value = (req.body as { refreshToken?: unknown })?.refreshToken;
    return typeof value === "string" ? value : null;
  }

  clearRefresh(_res: Response): void {
    // body transport stores nothing on the response — client clears localStorage itself
  }
}

export const bodyTransport: ITokenTransport = new BodyTransport();
