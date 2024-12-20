import express from "express";
import {
  addDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "./driverController.js";

const driverRouter = express.Router();

// Route to add a new driver
driverRouter.post("/add", addDriver);

// Route to get all drivers
driverRouter.get("/", getAllDrivers);

// Route to get a single driver by ID
driverRouter.get("/:id", getDriverById);

// Route to update driver by ID
driverRouter.put("/:id", updateDriver);

// Route to delete driver by ID
driverRouter.delete("/:id", deleteDriver);

export default driverRouter;
