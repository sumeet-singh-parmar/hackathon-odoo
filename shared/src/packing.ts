import { z } from "zod";

// server-side enum (mirrors prisma).
export const PackingCategoryValues = [
  "CLOTHING",
  "DOCUMENTS",
  "ELECTRONICS",
  "OTHER",
] as const;
export type PackingCategory = (typeof PackingCategoryValues)[number];

export const CreatePackingItemSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(PackingCategoryValues),
  isPacked: z.boolean().optional().default(false),
});
export type CreatePackingItemInput = z.infer<typeof CreatePackingItemSchema>;

export const UpdatePackingItemSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  category: z.enum(PackingCategoryValues).optional(),
  isPacked: z.boolean().optional(),
});
export type UpdatePackingItemInput = z.infer<typeof UpdatePackingItemSchema>;

// client-side six-category union for richer UX. Server-side dummy api accepts
// these directly; when wired to the real backend, extras (TOILETRIES, HEALTH,
// MISC) collapse to OTHER on the wire boundary.
export type ClientPackingCategory =
  | "DOCUMENTS"
  | "CLOTHING"
  | "ELECTRONICS"
  | "TOILETRIES"
  | "HEALTH"
  | "MISC";

// legacy client-shape input used by dummy api/hooks.
export interface AddPackingItemInput {
  name: string;
  category: ClientPackingCategory;
}

export interface PackingItemResponse {
  id: number;
  tripId: number;
  name: string;
  category: PackingCategory;
  isPacked: boolean;
  createdAt: string;
}

// client-side compat shape for dummy data + UI components (six-category).
export interface PackingItem {
  id: number;
  tripId: number;
  name: string;
  category: ClientPackingCategory;
  packed: boolean;
  createdAt: string;
}
