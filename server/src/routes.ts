import { Router } from "express";
import { authRouter } from "@/modules/auth/routes";
import { adminRouter } from "@/modules/admin/routes";
import { tripsRouter } from "@/modules/trips/routes";
import { citiesRouter } from "@/modules/cities/routes";
import { stopRouter } from "@/modules/trips/stop/stop.routes";
import {
  stopActivitiesRouter,
  tripActivityRouter,
} from "@/modules/trips/activity/activity.routes";
import { expenseRouter } from "@/modules/trips/budget/budget.routes";
import { packingItemRouter } from "@/modules/trips/packing/packing.routes";
import { noteRouter } from "@/modules/trips/note/note.routes";
import { publicRouter } from "@/modules/share/routes";
import { savedDestinationsRouter } from "@/modules/profile/saved-destinations/saved-destinations.routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/trips", tripsRouter);
router.use("/cities", citiesRouter);

// Standalone resources (not nested under /trips)
router.use("/stops/:stopId/activities", stopActivitiesRouter);
router.use("/stops", stopRouter);
router.use("/trip-activities", tripActivityRouter);
router.use("/expenses", expenseRouter);
router.use("/packing-items", packingItemRouter);
router.use("/notes", noteRouter);

// Profile-adjacent resources
router.use("/saved-destinations", savedDestinationsRouter);

// Public (no auth on read, auth on copy)
router.use("/public", publicRouter);
