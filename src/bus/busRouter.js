import express from 'express';
import { addBus, getBuses, getBusById, deleteBus, updateBus } from './busController.js';
import { busValidationRules } from './validation.js'; 
import { validate } from '../middlewares/validate.js';

const busRouter = express.Router();

// Routes for bus management
busRouter.route('/')
  .post(busValidationRules(), validate, addBus)  // Add new bus (Admin access only)
  .get(getBuses); // Get all buses (Public)

busRouter.route('/:id')
  .get(getBusById) // Get a specific bus by ID (Public)
  .delete(deleteBus) // Delete a bus by ID (Admin access only)
  .put(busValidationRules(), validate, updateBus); // Update a bus by ID (Admin access only)

export default busRouter;
