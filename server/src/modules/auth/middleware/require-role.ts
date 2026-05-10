import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { Forbidden, Unauthorized } from "@/core/errors";

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId || !req.role) return next(new Unauthorized());
    if (!allowed.includes(req.role)) return next(new Forbidden());
    next();
  };
}
