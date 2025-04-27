import express from "express";
import {
  addBus,
  getBuses,
  getBusById,
  deleteBus,
  updateBus,
  getBusesByAdminId,
  updateSeatStatusOfBus,
  getBusesOnSearchFilters,
} from "./busController.js";
import { busValidationRules } from "./validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";

const busRouter = express.Router();

busRouter.route("/").post(busValidationRules(), validate, addBus).get(getBuses);

busRouter.get("/ad-bus", getBusesByAdminId);

busRouter.post("/bus-advance-search", getBusesOnSearchFilters);

busRouter.patch("/update-seat-status", updateSeatStatusOfBus);

busRouter
  .route("/:id")
  .get(getBusById)
  .delete(authenticate, deleteBus)
  .put(validate, updateBus);

export default busRouter;
