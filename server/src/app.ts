import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "@/core/config/env";
import { router } from "@/routes";
import { errorHandler } from "@/core/middleware/error";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// avatars served from disk — see modules/auth/middleware/avatar-upload.ts
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", router);

app.use(errorHandler);
