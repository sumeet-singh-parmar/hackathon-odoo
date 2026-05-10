import { Router } from "express";
import { tripRouter } from "@/modules/trips/trip/trip.routes";
import { tripStopsRouter } from "@/modules/trips/stop/stop.routes";
import { budgetRouter } from "@/modules/trips/budget/budget.routes";
import { packingRouter } from "@/modules/trips/packing/packing.routes";
import { tripNotesRouter } from "@/modules/trips/note/note.routes";
import { tripShareRouter } from "@/modules/share/routes";

export const tripsRouter = Router({ mergeParams: true });

tripsRouter.use("/:tripId/stops", tripStopsRouter);
tripsRouter.use("/:tripId/budget", budgetRouter);
tripsRouter.use("/:tripId/packing", packingRouter);
tripsRouter.use("/:tripId/notes", tripNotesRouter);
tripsRouter.use("/:tripId/share", tripShareRouter);

tripsRouter.use("/", tripRouter);
