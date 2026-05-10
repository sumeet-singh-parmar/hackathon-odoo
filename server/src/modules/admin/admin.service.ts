import type { User, UserRole } from "@prisma/client";
import type { AdminStatsResponse } from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { userRepository } from "@/modules/auth/repositories/user.repository";
import { tokenService } from "@/modules/auth/services/token.service";
import { NotFound } from "@/core/errors";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const adminService = {
  async stats() {
    const since = new Date(Date.now() - SEVEN_DAYS_MS);
    const [totalUsers, newUsers7d, activeUsers7d] = await Promise.all([
      userRepository.list({ skip: 0, take: 1 }).then((r) => r.total),
      userRepository.countSince(since),
      userRepository.countActiveSince(since),
    ]);
    return { totalUsers, newUsers7d, activeUsers7d };
  },

  // Rich admin analytics: totals + top cities + top activities + recents +
  // average trip budget/days. Used by the AdminPage charts.
  async analytics(): Promise<AdminStatsResponse> {
    const [users, trips, publicTrips, stops, expenses, pinnedActivities] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.trip.count({ where: { isPublic: true } }),
      prisma.stop.count(),
      prisma.expense.count(),
      prisma.tripActivity.count(),
    ]);

    const topCityRows = await prisma.stop.groupBy({
      by: ["cityId"],
      _count: { cityId: true },
      orderBy: { _count: { cityId: "desc" } },
      take: 5,
    });
    const topCityDetails = await prisma.city.findMany({
      where: { id: { in: topCityRows.map((r) => r.cityId) } },
      select: { id: true, name: true, country: true },
    });
    const cityMap = new Map(topCityDetails.map((c) => [c.id, c]));
    const topCities = topCityRows.flatMap((r) => {
      const c = cityMap.get(r.cityId);
      return c ? [{ id: c.id, name: c.name, country: c.country, useCount: r._count.cityId }] : [];
    });

    const topActivityRows = await prisma.tripActivity.groupBy({
      by: ["activityId"],
      _count: { activityId: true },
      orderBy: { _count: { activityId: "desc" } },
      take: 5,
    });
    const topActivityDetails = await prisma.activity.findMany({
      where: { id: { in: topActivityRows.map((r) => r.activityId) } },
      select: { id: true, name: true, cityId: true },
    });
    const activityMap = new Map(topActivityDetails.map((a) => [a.id, a]));
    const topActivities = topActivityRows.flatMap((r) => {
      const a = activityMap.get(r.activityId);
      return a
        ? [{ id: a.id, name: a.name, cityId: a.cityId, useCount: r._count.activityId }]
        : [];
    });

    const tripsForAvg = await prisma.trip.findMany({
      select: {
        startDate: true,
        endDate: true,
        expenses: { select: { amount: true } },
      },
    });
    let totalBudget = 0;
    let totalDays = 0;
    for (const t of tripsForAvg) {
      totalDays += Math.floor((t.endDate.getTime() - t.startDate.getTime()) / ONE_DAY_MS) + 1;
      totalBudget += t.expenses.reduce((acc, e) => acc + e.amount, 0);
    }
    const averageTripBudget = trips > 0 ? Math.round((totalBudget / trips) * 100) / 100 : 0;
    const averageTripDays = trips > 0 ? Math.round((totalDays / trips) * 10) / 10 : 0;

    const [recentUsersRaw, recentTripsRaw] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
      }),
      prisma.trip.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, ownerId: true, createdAt: true },
      }),
    ]);

    return {
      totals: { users, trips, publicTrips, stops, expenses, pinnedActivities },
      topCities,
      topActivities,
      averageTripBudget,
      averageTripDays,
      recentUsers: recentUsersRaw.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        createdAt: u.createdAt.toISOString(),
      })),
      recentTrips: recentTripsRaw.map((t) => ({
        id: t.id,
        name: t.name,
        ownerId: t.ownerId,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  },

  async listUsers(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const { items, total } = await userRepository.list({ skip, take: pageSize });
    return {
      items: items.map(toAdminUser),
      total,
      page,
      pageSize,
    };
  },

  async setRole(id: number, role: UserRole) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFound("User not found");
    const updated = await userRepository.update(id, { role });
    // role change should kick existing sessions for safety
    await tokenService.revokeAllForUser(id);
    return toAdminUser(updated);
  },

  async deleteUser(id: number) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFound("User not found");
    await userRepository.delete(id);
  },
};

function toAdminUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    city: user.city,
    country: user.country,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}
