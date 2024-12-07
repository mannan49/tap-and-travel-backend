import express from "express";
import { fetchLocation, updateLocation } from "./locationController.js";

const locationRouter = express.Router();

locationRouter.post("/update", updateLocation);

locationRouter.post("/fetch", fetchLocation);

export default locationRouter;
