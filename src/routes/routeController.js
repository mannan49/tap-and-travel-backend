import Route from "./routeModel.js";

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
