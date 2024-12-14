import express from "express";
import {
  generateTicket,
  getTicketsForUser,
  cancelTicket,
  getTicketInformation,
} from "./ticketController.js";
import { authenticate } from "../middlewares/authenticate.js";

const ticketRouter = express.Router();

// Generate ticket (Authenticated users)
ticketRouter.post("/generate", generateTicket);

// Get all tickets for a user (Authenticated users)
ticketRouter.get("/user/:userId", getTicketsForUser);
ticketRouter.post("/user/information", getTicketInformation);

ticketRouter.get(
  "/user/information/:userId",
  authenticate,
  getTicketInformation
);

// Cancel a ticket by ID (Authenticated users)
ticketRouter.put("/cancel/:id", authenticate, cancelTicket);

export default ticketRouter;
