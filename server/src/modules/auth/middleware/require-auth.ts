import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { tokenService } from "@/modules/auth/services/token.service";
import { Unauthorized } from "@/core/errors";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      role?: UserRole;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new Unauthorized("Missing token"));
  }
  try {
    const claims = tokenService.verifyAccess(header.slice(7));
    req.userId = claims.userId;
    req.role = claims.role;
    next();
  } catch (err) {
    next(err);
  }
}
