import express from "express";
import {
  addBus,
  getBuses,
  getBusById,
  deleteBus,
  updateBus,
  getBusesByAdminId,
  updateSeatStatusOfBus,
} from "./busController.js";
import { busValidationRules } from "./validation.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";

const busRouter = express.Router();

busRouter.route("/").post( validate, addBus).get(getBuses);

busRouter.get("/ad-bus", getBusesByAdminId);

busRouter.patch("/update-seat-status", updateSeatStatusOfBus);

busRouter
  .route("/:id")
  .get(getBusById)
  .delete(authenticate, deleteBus)
  .put(busValidationRules(), validate, updateBus);

export default busRouter;
