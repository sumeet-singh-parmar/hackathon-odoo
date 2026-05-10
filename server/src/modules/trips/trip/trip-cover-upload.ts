import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { BadRequest } from "@/core/errors";

const UPLOAD_DIR = path.resolve("uploads/trip-covers");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const owner = req.userId ?? "anon";
    cb(null, `${owner}-${Date.now()}${ext}`);
  },
});

export const tripCoverUpload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new BadRequest("Cover must be jpg, png, or webp"));
    }
    cb(null, true);
  },
}).single("cover");

// public path that maps to UPLOAD_DIR via express.static("uploads")
export function publicTripCoverPath(filename: string): string {
  return `/uploads/trip-covers/${filename}`;
}

export function removeTripCoverFile(publicPath: string | null | undefined): void {
  if (!publicPath?.startsWith("/uploads/trip-covers/")) return;
  const abs = path.resolve(publicPath.replace(/^\//, ""));
  fs.promises.unlink(abs).catch(() => {});
}
