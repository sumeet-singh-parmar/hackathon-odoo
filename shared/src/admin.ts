import { z } from "zod";

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  city: string;
  country: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  tripCount?: number;
}

// client-side compat shape for the legacy 3-stat dashboard widget.
export interface AdminStats {
  totalUsers: number;
  newUsers7d: number;
  activeUsers7d: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const AdminListUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});
export type AdminListUsersQuery = z.infer<typeof AdminListUsersQuerySchema>;

export const AdminListTripsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminListTripsQuery = z.infer<typeof AdminListTripsQuerySchema>;

export interface AdminTripRow {
  id: number;
  name: string;
  ownerId: number;
  ownerEmail: string;
  isPublic: boolean;
  stopCount: number;
  status: "DRAFT" | "PLANNED" | "ONGOING" | "COMPLETED";
  createdAt: string;
}

export interface AdminStatsTotals {
  users: number;
  trips: number;
  publicTrips: number;
  stops: number;
  expenses: number;
  pinnedActivities: number;
}

export interface AdminTopCity {
  id: number;
  name: string;
  country: string;
  useCount: number;
}

export interface AdminTopActivity {
  id: number;
  name: string;
  cityId: number;
  useCount: number;
}

export interface AdminRecentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AdminRecentTrip {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
}

export interface AdminStatsResponse {
  totals: AdminStatsTotals;
  topCities: AdminTopCity[];
  topActivities: AdminTopActivity[];
  averageTripBudget: number;
  averageTripDays: number;
  recentUsers: AdminRecentUser[];
  recentTrips: AdminRecentTrip[];
}
