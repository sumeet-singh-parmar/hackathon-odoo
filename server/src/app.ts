import express from "express";
import cors from "cors";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", router);

app.use(errorHandler);
