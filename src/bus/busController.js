import mongoose from "mongoose";
import Admin from "../auth/admin/adminModel.js";
import BusEntity from "../busEntity/busEntityModel.js";
import Route from "../routes/routeModel.js";
import Bus from "./busModel.js";

function generateComplexSeatNumber(baseNumber) {
  const timestampPart = Date.now().toString().slice(-8); // Last 8 digits of the timestamp
  const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return `SEAT-${baseNumber + 1}-${timestampPart}-${randomPart}`;
}

export const addBus = async (req, res) => {
  const {
    busEntityId,
    adminId,
    driverId,
    routeId,
    departureTime,
    arrivalTime,
    date,
    fare,
  } = req.body;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const busEntity = await BusEntity.findById(busEntityId);
    if (!busEntity) {
      return res.status(404).json({ message: "Bus entity not found." });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: "Route not found." });
    }

    const busCapacity = busEntity.busCapacity;

    const createSeats = (busCapacity) => {
      return Array.from({ length: busCapacity }, (v, i) => {
        const seatNumber = generateComplexSeatNumber(i);
        const neighborSeatNumber =
          i % 2 === 0 && i + 1 < busCapacity ? (i + 2).toString() : null;

        return {
          seatNumber,
          neighborSeatNumber,
          booked: false,
          email: "",
          gender: "",
          neighborGender: "",
        };
      });
    };

    const seats = createSeats(busCapacity);

    const bus = new Bus({
      busEntityId,
      adminId,
      adminName: admin.name,
      driverId,
      routeId,
      route,
      departureTime,
      arrivalTime,
      date,
      busCapacity,
      busDetails: busEntity,
      seats,
      fare,
    });

    const createdBus = await bus.save();
    res.status(201).json({
      message: "Bus has been added!",
      id: createdBus._id,
    });
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (error) {
    console.error("Error retrieving buses:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single bus by ID
export const getBusById = async (req, res) => {
  const { id } = req.params || req.body;

  try {
    const bus = await Bus.findById(id);
    if (bus) {
      res.status(200).json(bus);
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    console.error("Error retrieving bus by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete bus by ID
export const deleteBus = async (req, res) => {
  const { id } = req.params;

  try {
    const bus = await Bus.findByIdAndDelete(id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    return res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Error deleting bus:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateBus = async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Destructure the entire body to allow flexible updates

  try {
    // Validate the id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    // Find the bus and update only the fields provided in the request
    const updatedBus = await Bus.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators for updates
    });

    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json({
      message: "Bus updated successfully",
      data: updatedBus,
    });
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSeatStatusOfBus = async (req, res) => {
  const { busId, seatsData } = req.body;
  try {
    const bus = await Bus.findOne({ _id: busId });
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    const updatedSeats = [];
    for (let seatData of seatsData) {
      const { seatNumber, booked, email, gender } = seatData;
      // Find the seat to update
      const seat = bus.seats.find((s) => s.seatNumber === seatNumber);

      if (!seat) {
        return res
          .status(404)
          .json({ message: `Seat ${seatNumber} not found` });
      }

      // Update the seat's details
      seat.booked = booked ?? true; // Defaults to true if not provided
      seat.email = email || seat.email; // Updates email if provided
      seat.gender = gender || seat.gender; // Updates gender if provided

      // Update the neighbor seat's neighborGender
      if (seat.neighborSeatNumber !== null) {
        const neighborSeatIndex = parseInt(seat.neighborSeatNumber, 10); // Get the neighbor seat's index
        const neighborSeat = bus.seats[neighborSeatIndex]; // Access the neighbor seat object

        if (neighborSeat) {
          neighborSeat.neighborGender = gender || neighborSeat.neighborGender; // Update neighbor's neighborGender
        }
      }

      updatedSeats.push(seat); // Add updated seat to the array
    }
    await bus.save();
    res.status(200).json({ message: "Seat status updated successfully" });
  } catch (error) {
    console.error("Error updating seat status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get buses by adminId or email
export const getBusesByAdminId = async (req, res) => {
  const { adminId, email } = req.query;

  try {
    let buses;

    // If an email is provided, fetch the adminId first
    if (email) {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      buses = await Bus.find({ adminId: admin._id }).lean();
    } else if (adminId) {
      buses = await Bus.find({ adminId }).lean();
    } else {
      return res
        .status(400)
        .json({ message: "Either adminId or email must be provided" });
    }

    // Enrich each bus object with driverName
    for (const bus of buses) {
      if (bus.driverId) {
        const driver = await Admin.findById(bus.driverId).select("name");
        bus.driverName = driver ? driver.name : null;
      } else {
        bus.driverName = null;
      }
    }

    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBusesOnSearchFilters = async (req, res) => {
  try {
    const filters = req.body;

    const query = {};

    // Define a mapping of non-nested keys to nested fields
    const nestedFieldsMapping = {
      startCity: "route.startCity",
      endCity: "route.endCity",
      busNumber: "busDetails.busNumber",
      engineNumber: "busDetails.engineNumber",
      actualPrice: "fare.actualPrice",
    };

    // Loop through filters and construct the query
    Object.keys(filters).forEach((key) => {
      if (nestedFieldsMapping[key]) {
        // If key exists in mapping, map it to the corresponding nested field
        query[nestedFieldsMapping[key]] = filters[key];
      } else {
        // Otherwise, use the key directly
        query[key] = filters[key];
      }
    });

    // Fetch the filtered buses
    const buses = await Bus.find(query);

    res.status(200).json({
      success: true,
      message: "Filtered buses retrieved successfully",
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching filtered buses",
      error: error.message,
    });
  }
};
