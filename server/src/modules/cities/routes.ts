import { Router } from "express";
import { cityRouter } from "@/modules/cities/city/city.routes";
import { catalogRouter } from "@/modules/cities/catalog/catalog.routes";

export const citiesRouter = Router();

citiesRouter.use("/activities", catalogRouter);
citiesRouter.use("/", cityRouter);
