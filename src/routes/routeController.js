import axios from "axios";
import EventTypes from "../constants/eventTypes.js";
import Route from "./routeModel.js";
import config from "../config/index.js";

// Get all routes
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoutesByAdminId = async (req, res) => {
  try {
    const { adminId } = req.query;
    const routes = await Route.find({ adminId });
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single route by ID
export const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new route
export const createRoute = async (req, res) => {
  try {
    const { adminId, startCity, endCity, stops } = req.body;

    const newRoute = new Route({
      adminId,
      startCity,
      endCity,
      stops,
    });

    await newRoute.save();

    res.locals.logEvent = {
      eventName: EventTypes.ADMIN_ADD_ROUTE,
      payload: newRoute,
    };

    res.status(201).json({
      message: "Route has been added successfully!",
      routeId: newRoute._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an existing route
export const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRoute = await Route.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.status(200).json({
      message: "Route has been updated successfully!",
      routeId: updatedRoute._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a route
export const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoute = await Route.findByIdAndDelete(id);
    if (!deletedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.status(200).json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const placeSearchController = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const baseUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";
  const aggregatedResults = [];

  try {
    let pageToken = null;
    let attempts = 0;
    let status = "OK";

    do {
      const params = {
        query,
        key: config.GOOGLE_MAPS_API_KEY,
      };

      if (pageToken) {
        params.pagetoken = pageToken;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for token to activate
      }

      const response = await axios.get(baseUrl, { params });

      if (
        response.data.status !== "OK" &&
        response.data.status !== "ZERO_RESULTS"
      ) {
        return res.status(500).json({
          error: "Google Maps API Error",
          status: response.data.status,
        });
      }

      const { results, next_page_token } = response.data;

      aggregatedResults.push(...results);
      pageToken = next_page_token;
      status = response.data.status;

      attempts++;
    } while (pageToken && attempts < 3);

    res.json({
      // add query key here
      totalCount: aggregatedResults.length,
      status,
      results: aggregatedResults,
    });
  } catch (err) {
    console.error("Google Places API Error:", err.message);
    next(err);
  }
};
