import express from "express";
import { placeSearchController } from "./placeController.js";

const placeRouter = express.Router();

placeRouter.get("/place-search", placeSearchController);

export default placeRouter;
