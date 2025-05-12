import mongoose from "mongoose";
import Admin from "../auth/admin/adminModel.js";
import BusEntity from "../busEntity/busEntityModel.js";
import Route from "../routes/routeModel.js";
import Bus from "./busModel.js";
import EventTypes from "../constants/eventTypes.js";
import { calculateEndDate } from "../helpers/calculateEndDate.js";
import moment from "moment-timezone";

function generateComplexSeatNumber(baseNumber) {
  const timestampPart = Date.now().toString().slice(-8);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
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

    const departureDateTime = moment
      .tz(`${date} ${departureTime}`, "YYYY-MM-DD HH:mm", "Asia/Karachi")
      .utc()
      .toDate();

    const endDate = calculateEndDate(date, departureTime, arrivalTime);

    const bus = new Bus({
      busEntityId,
      adminId,
      adminName: admin?.name,
      driverId,
      routeId,
      route,
      departureTime,
      arrivalTime,
      date: departureDateTime,
      endDate,
      busCapacity,
      status: "scheduled",
      busDetails: busEntity,
      seats,
      fare,
    });

    const createdBus = await bus.save();
    res.locals.logEvent = {
      eventName: EventTypes.ADMIN_ADD_BUS,
      payload: createdBus,
    };
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

    const busesWithAvailableSeats = buses.map((bus) => {
      // Count seats where booked is false
      const availableSeats = bus.seats.filter(
        (seat) => seat.booked === false
      ).length;

      return {
        ...bus._doc,
        availableSeats,
      };
    });

    res.status(200).json(busesWithAvailableSeats);
  } catch (error) {
    console.error("Error retrieving buses:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Future Buses

export const getFutureBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find();

    const now = moment.utc(); // current UTC time

    const validBuses = buses.filter((bus) => {
      const departureDateTime = moment.utc(bus.date); // full departure datetime in UTC
      return departureDateTime.isAfter(now); // only keep buses that haven't departed yet
    });

    const busesWithAvailableSeats = validBuses.map((bus) => {
      const availableSeats = bus.seats.filter((seat) => !seat.booked).length;

      return {
        ...bus._doc,
        availableSeats,
      };
    });

    res.status(200).json(busesWithAvailableSeats);
  } catch (error) {
    return next({ status: 500, message: error.message });
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
  const updates = { ...req.body };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    const hasDateOrTimeChanged =
      updates.date || updates.departureTime || updates.arrivalTime;

    if (hasDateOrTimeChanged) {
      const bus = await Bus.findById(id);
      if (!bus) return res.status(404).json({ message: "Bus not found" });

      let baseDateString;
      if (updates.date) {
        baseDateString = moment(updates.date).utcOffset(5).format("YYYY-MM-DD");
      } else {
        baseDateString = moment(bus.date).utcOffset(5).format("YYYY-MM-DD");
      }

      const departureTime = updates.departureTime || bus.departureTime;
      const arrivalTime = updates.arrivalTime || bus.arrivalTime;

      const departureDateTime = moment
        .tz(
          `${baseDateString} ${departureTime}`,
          "YYYY-MM-DD HH:mm",
          "Asia/Karachi"
        )
        .utc()
        .toDate();

      updates.date = departureDateTime;
      updates.endDate = calculateEndDate(
        baseDateString,
        departureTime,
        arrivalTime
      );
    }

    const updatedBus = await Bus.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.locals.logEvent = {
      eventName: EventTypes.ADMIN_UPDATE_BUS,
      payload: updatedBus,
    };

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
      seat.booked = booked ?? true;
      seat.email = email || seat.email;
      seat.gender = gender || seat.gender;

      const parts = seat.seatNumber.split("-");
      const seatIndex = parseInt(parts[1], 10);

      if (
        seat.neighborSeatNumber === null ||
        seat.neighborSeatNumber === undefined
      ) {
        const neighborIndex =
          seatIndex % 2 === 0 ? seatIndex - 1 : seatIndex + 1;
        seat.neighborSeatNumber = neighborIndex.toString();
      }

      const neighborSeat = bus.seats.find((s) => {
        const neighborParts = s.seatNumber.split("-");
        return (
          parseInt(neighborParts[1], 10) ===
          parseInt(seat.neighborSeatNumber, 10)
        );
      });

      if (neighborSeat) {
        neighborSeat.neighborGender = gender || neighborSeat.neighborGender;
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

export const updateBusStatus = async (req, res) => {
  try {
    const { busId, status } = req.body;

    if (!busId || !status) {
      return res
        .status(400)
        .json({ message: "busId and status are required." });
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      { status },
      { new: true }
    );

    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found." });
    }

    return res.status(200).json({
      message: "Bus status updated successfully.",
      bus: updatedBus,
    });
  } catch (error) {
    console.error("Error updating bus status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
