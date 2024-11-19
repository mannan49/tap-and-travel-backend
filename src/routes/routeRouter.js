import express from 'express';
import { createRoute, deleteRoute, getAllRoutes, getRouteById, updateRoute } from './routeController.js';


const router = express.Router();

// Define routes
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);
router.post('/', createRoute); 
router.put('/:id', updateRoute); 
router.delete('/:id', deleteRoute); 

export default router;
