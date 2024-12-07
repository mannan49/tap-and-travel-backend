import Location from "./locationModel.js";

export const updateLocation = async (req, res) => {
  try {
    const { userId, adminId, latitude, longitude, role, busId } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and Longitude are required." });
    }

    // Build the query and update object based on role and IDs
    const query = { busId };
    const update =
      role === "user"
        ? {
            userId,
            userLatitude: latitude,
            userLongitude: longitude,
            lastUpdated: new Date(),
          }
        : {
            adminId,
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
    const { userId, adminId, busId } = req.body;

    if (!userId && !adminId) {
      return res
        .status(400)
        .json({ message: "Either userId or adminId is required." });
    }

    //   if (!busId) {
    //     return res
    //       .status(400)
    //       .json({ message: "busId is required." });
    //   }

    // Query based on busId and provided IDs
    const query = { busId };
    if (userId) {
      query.userId = userId;
    } else if (adminId) {
      query.adminId = adminId;
    }

    const location = await Location.findOne(query);

    if (!location) {
      return res
        .status(404)
        .json({ message: "No location found for the provided IDs." });
    }

    res
      .status(200)
      .json({ message: "Location fetched successfully.", data: location });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching location.", error: error.message });
  }
};
