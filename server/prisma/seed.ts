import { PrismaClient, type ActivityType, type PackingCategory } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_PASSWORD = "hackathon123";

interface CityRow {
  name: string;
  country: string;
  costIndex: number;
  popularity: number;
  region: string;
  description?: string;
}

interface ActivityRow {
  cityName: string;
  name: string;
  type: ActivityType;
  baseCost: number;
  durationHours: number;
  description?: string;
}

interface CityRowWithImage extends CityRow {
  imageUrl?: string;
}

async function seedCities() {
  const cities = JSON.parse(
    readFileSync(join(__dirname, "..", "seed", "cities.json"), "utf-8"),
  ) as CityRowWithImage[];
  const activities = JSON.parse(
    readFileSync(join(__dirname, "..", "seed", "activities.json"), "utf-8"),
  ) as ActivityRow[];

  const existing = await prisma.city.count();
  if (existing === 0) {
    console.log(`seeding ${cities.length} cities...`);
    await prisma.city.createMany({ data: cities });
  } else {
    // refresh imageUrl/description on the existing rows so re-runs pick up
    // updated cover images without needing a full reset.
    console.log(`cities already seeded (${existing}), refreshing imageUrl + description`);
    for (const c of cities) {
      await prisma.city.updateMany({
        where: { name: c.name },
        data: {
          imageUrl: c.imageUrl ?? null,
          description: c.description ?? null,
        },
      });
    }
  }

  const cityRecords = await prisma.city.findMany({ select: { id: true, name: true } });
  const cityByName = new Map(cityRecords.map((c) => [c.name, c.id]));

  const existingActivityCount = await prisma.activity.count();
  if (existingActivityCount === 0) {
    const activityRows = activities
      .map((a) => {
        const cityId = cityByName.get(a.cityName);
        if (!cityId) {
          console.warn(`unknown city "${a.cityName}" for activity "${a.name}", skipping`);
          return null;
        }
        return {
          cityId,
          name: a.name,
          type: a.type,
          baseCost: a.baseCost,
          durationHours: a.durationHours,
          description: a.description ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    console.log(`seeding ${activityRows.length} activities...`);
    await prisma.activity.createMany({ data: activityRows });
  } else {
    console.log(`activities already seeded (${existingActivityCount}), skipping`);
  }
}

interface DemoUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  country: string;
  role: "USER" | "ADMIN";
  additionalInfo?: string;
}

const demoUsers: DemoUser[] = [
  {
    email: "sumeet@traveloop.app",
    username: "sumeet_k",
    firstName: "Sumeet",
    lastName: "Kumar",
    phoneNumber: "+91 9000000001",
    city: "Bengaluru",
    country: "India",
    role: "ADMIN",
    additionalInfo: "Frontend on Traveloop. Loves cherry blossoms.",
  },
  {
    email: "nisha@traveloop.app",
    username: "nisha_dev",
    firstName: "Nisha",
    lastName: "Kumar",
    phoneNumber: "+91 9000000002",
    city: "Bengaluru",
    country: "India",
    role: "ADMIN",
    additionalInfo: "Backend on Traveloop. Lives by Postgres indexes.",
  },
  {
    email: "demo@traveloop.app",
    username: "demo_traveller",
    firstName: "Demo",
    lastName: "Traveller",
    phoneNumber: "+1 5550000003",
    city: "Lisbon",
    country: "Portugal",
    role: "USER",
    additionalInfo: "Always one carry-on, never checked.",
  },
];

async function seedUsers() {
  const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`user ${u.email} already exists, skipping`);
      continue;
    }
    await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        password: hashed,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
        city: u.city,
        country: u.country,
        role: u.role,
        additionalInfo: u.additionalInfo,
        language: "en",
        lastLoginAt: new Date(),
      },
    });
    console.log(`seeded user ${u.email}`);
  }
}

interface SeedStop {
  cityName: string;
  startDate: string;
  endDate: string;
  pinActivities: number; // how many activities from the city catalog to pin
}

interface SeedTrip {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string;
  status: "DRAFT" | "PLANNED" | "ONGOING" | "COMPLETED";
  isPublic?: boolean;
  shareSlug?: string;
  stops: SeedStop[];
  packing: { name: string; category: PackingCategory; isPacked?: boolean }[];
  notes: { text: string; cityName?: string }[];
}

const seedTrips: SeedTrip[] = [
  {
    name: "Cherry blossom in Japan",
    description: "Two weeks weaving through Tokyo and Kyoto — temples, ramen, hot springs.",
    startDate: "2026-03-28",
    endDate: "2026-04-10",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=70",
    status: "PLANNED",
    isPublic: true,
    shareSlug: "trv_japan_demo",
    stops: [
      { cityName: "Tokyo", startDate: "2026-03-28", endDate: "2026-04-02", pinActivities: 3 },
      { cityName: "Kyoto", startDate: "2026-04-02", endDate: "2026-04-10", pinActivities: 3 },
    ],
    packing: [
      { name: "Passport", category: "DOCUMENTS", isPacked: true },
      { name: "JR Pass voucher", category: "DOCUMENTS", isPacked: true },
      { name: "Travel insurance card", category: "DOCUMENTS" },
      { name: "Lightweight rain jacket", category: "CLOTHING" },
      { name: "Walking shoes", category: "CLOTHING", isPacked: true },
      { name: "5x t-shirts", category: "CLOTHING" },
      { name: "Phone + charger", category: "ELECTRONICS", isPacked: true },
      { name: "Universal adapter", category: "ELECTRONICS" },
      { name: "20k power bank", category: "ELECTRONICS" },
      { name: "Toothbrush + paste", category: "OTHER" },
      { name: "Sunscreen", category: "OTHER" },
      { name: "Allergy meds", category: "OTHER", isPacked: true },
    ],
    notes: [
      { text: "Book TeamLab Planets tickets in advance — they sell out 3 weeks ahead.", cityName: "Tokyo" },
      { text: "Get a Suica card on arrival. Don't bother with cash." },
      { text: "Reserve a kaiseki dinner in Gion — small places only do dinner once a night.", cityName: "Kyoto" },
    ],
  },
  {
    name: "A slow week in Lisbon",
    description: "Pastel houses, fado bars, and as many pastéis de nata as humanly possible.",
    startDate: "2026-06-04",
    endDate: "2026-06-11",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=70",
    status: "PLANNED",
    isPublic: true,
    shareSlug: "trv_lisbon_demo",
    stops: [
      { cityName: "Lisbon", startDate: "2026-06-04", endDate: "2026-06-11", pinActivities: 4 },
    ],
    packing: [
      { name: "Passport", category: "DOCUMENTS" },
      { name: "Light dresses x3", category: "CLOTHING" },
      { name: "Sunglasses", category: "OTHER", isPacked: true },
      { name: "Sandals + sneakers", category: "CLOTHING" },
      { name: "Phone charger", category: "ELECTRONICS" },
    ],
    notes: [
      { text: "Manteigaria's pastéis are arguably better than Belém. Don't fight me." },
      { text: "Take the first train to Sintra — the 8am one is empty.", cityName: "Lisbon" },
    ],
  },
  {
    name: "Iceland ring road",
    description: "10 days driving the ring road. Glaciers, geysers, hopefully aurora.",
    startDate: "2026-09-12",
    endDate: "2026-09-22",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1490650034439-fd184c3c86a5?auto=format&fit=crop&w=1200&q=70",
    status: "DRAFT",
    stops: [],
    packing: [
      { name: "Thermal base layers", category: "CLOTHING" },
      { name: "Waterproof boots", category: "CLOTHING" },
      { name: "Driver's license", category: "DOCUMENTS" },
    ],
    notes: [],
  },
  {
    name: "Bali for the soul",
    description: "Rice fields in Ubud, surf in Canggu, sunsets in Uluwatu.",
    startDate: "2025-11-04",
    endDate: "2025-11-18",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=70",
    status: "COMPLETED",
    isPublic: true,
    shareSlug: "trv_bali_demo",
    stops: [
      { cityName: "Bali", startDate: "2025-11-04", endDate: "2025-11-18", pinActivities: 4 },
    ],
    packing: [
      { name: "Swim shorts x2", category: "CLOTHING", isPacked: true },
      { name: "Surfboard travel bag", category: "OTHER", isPacked: true },
      { name: "Reef-safe sunscreen", category: "OTHER", isPacked: true },
    ],
    notes: [
      { text: "Best warung in Ubud is the one without a sign — ask the locals." },
      { text: "Sunrise hike up Mount Batur was the highlight.", cityName: "Bali" },
    ],
  },
  {
    name: "Mexico City weekend",
    description: "Long weekend of tacos, museums, and rooftop mezcal bars.",
    startDate: "2026-08-15",
    endDate: "2026-08-19",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=70",
    status: "DRAFT",
    stops: [],
    packing: [],
    notes: [],
  },
];

async function seedTripsForDemo() {
  const owner = await prisma.user.findUnique({ where: { email: "demo@traveloop.app" } });
  if (!owner) {
    console.warn("demo@traveloop.app not found, skipping trip seed");
    return;
  }

  const existingTrips = await prisma.trip.count({ where: { ownerId: owner.id } });
  if (existingTrips > 0) {
    console.log(`demo user already has ${existingTrips} trips, skipping`);
    return;
  }

  const cityRecords = await prisma.city.findMany({ select: { id: true, name: true } });
  const cityByName = new Map(cityRecords.map((c) => [c.name, c.id]));

  for (const t of seedTrips) {
    console.log(`seeding trip "${t.name}"...`);
    const trip = await prisma.trip.create({
      data: {
        ownerId: owner.id,
        name: t.name,
        description: t.description,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        coverPhotoUrl: t.coverPhotoUrl,
        status: t.status,
        isPublic: t.isPublic ?? false,
        shareSlug: t.shareSlug ?? null,
        currency: "USD",
      },
      select: { id: true },
    });

    // stops with their pinned activities
    const stopIdByCityName = new Map<string, number>();
    for (let i = 0; i < t.stops.length; i++) {
      const s = t.stops[i];
      const cityId = cityByName.get(s.cityName);
      if (!cityId) {
        console.warn(`  unknown city "${s.cityName}", skipping stop`);
        continue;
      }
      const stop = await prisma.stop.create({
        data: {
          tripId: trip.id,
          cityId,
          startDate: new Date(s.startDate),
          endDate: new Date(s.endDate),
          orderIndex: i,
        },
        select: { id: true },
      });
      stopIdByCityName.set(s.cityName, stop.id);

      if (s.pinActivities > 0) {
        const cityActivities = await prisma.activity.findMany({
          where: { cityId },
          take: s.pinActivities,
          orderBy: { id: "asc" },
          select: { id: true },
        });
        if (cityActivities.length > 0) {
          await prisma.tripActivity.createMany({
            data: cityActivities.map((a) => ({
              stopId: stop.id,
              activityId: a.id,
            })),
          });
        }
      }
    }

    // packing
    if (t.packing.length > 0) {
      await prisma.packingItem.createMany({
        data: t.packing.map((p) => ({
          tripId: trip.id,
          name: p.name,
          category: p.category,
          isPacked: p.isPacked ?? false,
        })),
      });
    }

    // notes (with optional stop linkage)
    for (const n of t.notes) {
      await prisma.tripNote.create({
        data: {
          tripId: trip.id,
          stopId: n.cityName ? (stopIdByCityName.get(n.cityName) ?? null) : null,
          text: n.text,
        },
      });
    }
  }
}

async function autoEstimateAll() {
  // Inline auto-estimate (mirrors trips/budget/budget.service.ts) to avoid
  // pulling express-bound modules into the seed runtime.
  const HOTEL_PER_DAY = 80;
  const MEALS_PER_DAY = 40;
  const TRANSPORT_PER_TRANSITION = 100;
  const ONE_DAY_MS = 1000 * 60 * 60 * 24;

  const trips = await prisma.trip.findMany({
    select: {
      id: true,
      stops: {
        select: {
          startDate: true,
          endDate: true,
          city: { select: { costIndex: true } },
          activities: {
            select: { customCost: true, activity: { select: { baseCost: true } } },
          },
        },
      },
    },
  });

  for (const t of trips) {
    if (t.stops.length === 0) continue;
    const newRows: {
      tripId: number;
      category: "TRANSPORT" | "STAY" | "ACTIVITIES" | "MEALS";
      amount: number;
      day: Date;
      note: string;
      isAuto: boolean;
    }[] = [];

    for (const stop of t.stops) {
      const days =
        Math.floor((stop.endDate.getTime() - stop.startDate.getTime()) / ONE_DAY_MS) + 1;
      const stayPerDay = Math.round(HOTEL_PER_DAY * stop.city.costIndex);
      const mealsPerDay = Math.round(MEALS_PER_DAY * stop.city.costIndex);
      const transport = Math.round(TRANSPORT_PER_TRANSITION * stop.city.costIndex);
      const activities = stop.activities.reduce(
        (acc, a) => acc + (a.customCost ?? a.activity.baseCost),
        0,
      );

      newRows.push({
        tripId: t.id,
        category: "TRANSPORT",
        amount: transport,
        day: stop.startDate,
        note: "Auto-estimated transport",
        isAuto: true,
      });
      for (let i = 0; i < days; i++) {
        const day = new Date(stop.startDate.getTime() + i * ONE_DAY_MS);
        newRows.push({
          tripId: t.id,
          category: "STAY",
          amount: stayPerDay,
          day,
          note: "Auto-estimated stay",
          isAuto: true,
        });
        newRows.push({
          tripId: t.id,
          category: "MEALS",
          amount: mealsPerDay,
          day,
          note: "Auto-estimated meals",
          isAuto: true,
        });
      }
      if (activities > 0) {
        newRows.push({
          tripId: t.id,
          category: "ACTIVITIES",
          amount: Math.round(activities),
          day: stop.startDate,
          note: "Auto-estimated activities",
          isAuto: true,
        });
      }
    }

    if (newRows.length > 0) {
      await prisma.expense.createMany({ data: newRows });
    }
  }
}

async function refreshTripCoversAndVisibility() {
  // Re-applies cover photo + isPublic + shareSlug from the seed list to
  // already-seeded trips by name. Lets us tweak photos and re-run `npm run seed`
  // without having to wipe the DB.
  for (const t of seedTrips) {
    await prisma.trip.updateMany({
      where: { name: t.name },
      data: {
        coverPhotoUrl: t.coverPhotoUrl,
        isPublic: t.isPublic ?? false,
        shareSlug: t.shareSlug ?? null,
      },
    });
  }
}

async function main() {
  await seedCities();
  await seedUsers();
  await seedTripsForDemo();
  await refreshTripCoversAndVisibility();
  await autoEstimateAll();
  console.log("seed complete");
  console.log(`  → sign in as demo@traveloop.app / ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
