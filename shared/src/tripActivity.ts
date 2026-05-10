import { z } from "zod";
import type { ActivityType } from "./activity";

export const PinActivitySchema = z.object({
  activityId: z.number().int().positive(),
  scheduledTime: z.string().datetime().nullable().optional(),
  customCost: z.number().min(0).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});
export type PinActivityInput = z.infer<typeof PinActivitySchema>;

export const UpdateTripActivitySchema = z.object({
  scheduledTime: z.string().datetime().nullable().optional(),
  customCost: z.number().min(0).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});
export type UpdateTripActivityInput = z.infer<typeof UpdateTripActivitySchema>;

export interface ActivityRef {
  id: number;
  cityId: number;
  name: string;
  type: ActivityType;
  baseCost: number;
  durationHours: number;
  description: string | null;
}

export interface TripActivityResponse {
  id: number;
  stopId: number;
  activityId: number;
  activity: ActivityRef;
  scheduledTime: string | null;
  customCost: number | null;
  notes: string | null;
  createdAt: string;
}
