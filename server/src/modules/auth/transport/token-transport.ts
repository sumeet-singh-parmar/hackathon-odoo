import type { Request, Response } from "express";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenTransport {
  sendPair(res: Response, pair: TokenPair, body?: Record<string, unknown>): void;
  sendAccess(res: Response, accessToken: string, refreshToken: string): void;
  readRefresh(req: Request): string | null;
  clearRefresh(res: Response): void;
}
