import { z } from "zod";
import type { TripActivityResponse } from "./tripActivity";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be yyyy-mm-dd");

export const CreateStopSchema = z
  .object({
    cityId: z.number().int().positive(),
    startDate: dateString,
    endDate: dateString,
    // client-form compat — accepted but not persisted on the Stop model.
    transport: z.enum(["FLIGHT", "TRAIN", "BUS", "CAR", "OTHER"]).nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });
export type CreateStopInput = z.infer<typeof CreateStopSchema>;

export const UpdateStopSchema = z
  .object({
    cityId: z.number().int().positive().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });
export type UpdateStopInput = z.infer<typeof UpdateStopSchema>;

export const ReorderStopsSchema = z.object({
  stops: z
    .array(
      z.object({
        stopId: z.number().int().positive(),
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});
export type ReorderStopsInput = z.infer<typeof ReorderStopsSchema>;

export interface CityRef {
  id: number;
  name: string;
  country: string;
  region: string | null;
}

export interface StopResponse {
  id: number;
  tripId: number;
  cityId: number;
  city: CityRef;
  startDate: string;
  endDate: string;
  orderIndex: number;
  createdAt: string;
  activities: TripActivityResponse[];
}

// client-side compat shape for dummy data + UI components.
export interface Stop {
  id: number;
  tripId: number;
  cityId: number;
  cityName: string;
  countryName: string;
  arrivalDate: string;
  departureDate: string;
  transport: "FLIGHT" | "TRAIN" | "BUS" | "CAR" | "OTHER" | null;
  notes: string | null;
  order: number;
}
