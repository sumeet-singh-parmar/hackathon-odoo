import type { Request, Response, NextFunction } from "express";

export function cacheControl(maxAgeSec: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set("Cache-Control", `public, max-age=${maxAgeSec}`);
    next();
  };
}
