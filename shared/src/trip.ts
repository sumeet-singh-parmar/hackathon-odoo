import { z } from "zod";
import type { StopResponse } from "./stop";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be yyyy-mm-dd");

export const TripStatusValues = ["DRAFT", "PLANNED", "ONGOING", "COMPLETED"] as const;
export type TripStatus = (typeof TripStatusValues)[number];

export const CreateTripSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(2000).nullable().optional(),
    startDate: dateString,
    endDate: dateString,
    currency: z.string().trim().min(1).max(8).default("USD"),
    status: z.enum(TripStatusValues).default("DRAFT"),
    // client-form compat — accepted but not persisted as columns.
    // `budget` is informational; `visibility` flips `isPublic` server-side later via /share.
    budget: z.number().min(0).nullable().optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
    coverUrl: z.string().url().nullable().optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });
export type CreateTripInput = z.infer<typeof CreateTripSchema>;

export const UpdateTripSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    coverPhotoUrl: z.string().url().nullable().optional(),
    coverUrl: z.string().url().nullable().optional(),
    budget: z.number().min(0).nullable().optional(),
    currency: z.string().trim().min(1).max(8).optional(),
    status: z.enum(TripStatusValues).optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>;

export const ListTripsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListTripsQuery = z.infer<typeof ListTripsQuerySchema>;

export interface TripSummary {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  isPublic: boolean;
  shareSlug: string | null;
  status: TripStatus;
  currency: string;
  stopCount: number;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListTripsResponse {
  items: TripSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface TripDetail {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  isPublic: boolean;
  shareSlug: string | null;
  status: TripStatus;
  currency: string;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
  stops: StopResponse[];
}

// client-side domain shape used by dummy data + UI components.
// kept separate from TripDetail (server response) until those merge.
export type TripVisibility = "PRIVATE" | "PUBLIC";
export interface Trip {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverUrl: string | null;
  budget: number | null;
  currency: string;
  visibility: TripVisibility;
  status: TripStatus;
  shareToken: string | null;
  stopCount?: number;
  createdAt: string;
  updatedAt: string;
}
