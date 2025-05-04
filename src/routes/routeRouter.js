import express from "express";
import {
  createRoute,
  deleteRoute,
  getAllRoutes,
  getRouteById,
  getRoutesByAdminId,
  placeSearchController,
  updateRoute,
} from "./routeController.js";

const routeRouter = express.Router();

// Define routes
routeRouter.get("/place-search", placeSearchController);
// routeRouter.get("/", getAllRoutes);
routeRouter.get("/:id", getRouteById);
routeRouter.post("/", createRoute);
routeRouter.put("/:id", updateRoute);
routeRouter.delete("/:id", deleteRoute);
routeRouter.get("/", getRoutesByAdminId);

export default routeRouter;
