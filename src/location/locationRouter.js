import express from "express";
import { advancedSearchLocation, fetchLocation, updateLocation } from "./locationController.js";

const locationRouter = express.Router();

locationRouter.post("/update", updateLocation);

locationRouter.post("/fetch", fetchLocation);

locationRouter.post("/location-advance-search", advancedSearchLocation);

export default locationRouter;
