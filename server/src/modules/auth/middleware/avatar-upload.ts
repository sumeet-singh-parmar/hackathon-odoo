import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { BadRequest } from "@/core/errors";

const UPLOAD_DIR = path.resolve("uploads/avatars");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const owner = req.userId ?? "new";
    cb(null, `${owner}-${Date.now()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new BadRequest("Avatar must be jpg, png, or webp"));
    }
    cb(null, true);
  },
}).single("avatar");

// the public path that maps to UPLOAD_DIR via express.static("uploads")
export function publicAvatarPath(filename: string): string {
  return `/uploads/avatars/${filename}`;
}

// remove a previously stored avatar from disk — silent on miss
export function removeAvatarFile(publicPath: string | null | undefined): void {
  if (!publicPath?.startsWith("/uploads/avatars/")) return;
  const abs = path.resolve(publicPath.replace(/^\//, ""));
  fs.promises.unlink(abs).catch(() => {});
}
