import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { Unauthorized } from "../lib/errors";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new Unauthorized("Missing token"));
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.userId;
    next();
  } catch {
    next(new Unauthorized("Invalid token"));
  }
}
