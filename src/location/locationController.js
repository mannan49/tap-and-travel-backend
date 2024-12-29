import mongoose from "mongoose";
import Location from "./locationModel.js";

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, busId, driverId } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and Longitude are required." });
    }

    const query = { busId };
    const update = {
          adminId: driverId,
          driverLatitude: latitude,
          driverLongitude: longitude,
          lastUpdated: new Date(),
    };

    // Upsert location data (update if exists, insert if not)
    const updatedLocation = await Location.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
    });

    res.status(200).json({
      message: "Location updated successfully.",
      data: updatedLocation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating location.", error: error.message });
  }
};

// Fetch location (pairing of driver and rider)

export const fetchLocation = async (req, res) => {
  try {
    const { busId } = req.body;

    // Validate busId format
    // if (!busId || !mongoose.Types.ObjectId.isValid(busId)) {
    //   return res.status(400).json({ message: "Invalid or missing busId." });
    // }

    // Query the database by busId
    const location = await Location.findOne({ busId: new mongoose.Types.ObjectId(busId) });

    if (!location) {
      return res
        .status(404)
        .json({ message: "No location found for the provided busId." });
    }

    res.status(200).json({
      message: "Location fetched successfully.",
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching location.",
      error: error.message,
    });
  }
};



export const advancedSearchLocation = async (req, res) => {
  try {
    const { adminId, busId } = req.body;

    const query = {};
    if (adminId) query.adminId = adminId;
    if (busId) query.busId = busId;

    const locations = await Location.find(query);

    // Check if no results are found
    if (locations.length === 0) {
      return res.status(404).json({
        message: "No locations match the provided criteria.",
      });
    }

    res.status(200).json({
      message: "Locations fetched successfully.",
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching locations.",
      error: error.message,
    });
  }
};
