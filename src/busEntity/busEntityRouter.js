import express from "express";
import {
  createBusEntity,
  getAllBusEntities,
  getBusEntityById,
  updateBusEntity,
  deleteBusEntity,
  getBusEntitiesByAdminId,
} from "./busEntityController.js";

const busEntityRouter = express.Router();

// Create a new BusEntity
busEntityRouter.post("/", createBusEntity);

// Get all BusEntities
busEntityRouter.get("/", getAllBusEntities);

// Get a specific BusEntity by ID
busEntityRouter.get("/:id", getBusEntityById);
busEntityRouter.get("/:adminId", getBusEntitiesByAdminId);

// Update a specific BusEntity
busEntityRouter.put("/:id", updateBusEntity);

// Delete a specific BusEntity
busEntityRouter.delete("/:id", deleteBusEntity);

export default busEntityRouter;
