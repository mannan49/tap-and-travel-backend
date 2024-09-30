import express from 'express';
import { generateTicket, getTicketsForUser, cancelTicket } from './ticketController.js';
import { authenticate } from '../middlewares/authenticate.js';

const ticketRouter = express.Router();

// Generate ticket (Authenticated users)
ticketRouter.post('/generate', authenticate, generateTicket);

// Get all tickets for a user (Authenticated users)
ticketRouter.get('/user/:userId', authenticate, getTicketsForUser);

// Cancel a ticket by ID (Authenticated users)
ticketRouter.put('/cancel/:id', authenticate, cancelTicket);

export default ticketRouter;
