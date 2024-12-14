import Bus from "./busModel.js";

const generateBusId = () => {
  // Generate a unique bus ID based on the current timestamp and a random number
  return `BUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
function generateComplexSeatNumber(baseNumber) {
  const timestampPart = Date.now().toString().slice(-8); // Last 8 digits of the timestamp
  const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return `SEAT-${baseNumber + 1}-${timestampPart}-${randomPart}`;
}

export const addBus = async (req, res) => {
  const {
    adminId,
    route,
    departureTime,
    arrivalTime,
    date,
    busCapacity,
    busDetails,
    fare,
  } = req.body;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminName = admin.name;
    const createSeats = (busCapacity) => {
      return Array.from({ length: busCapacity }, (v, i) => {
        const seatNumber = generateComplexSeatNumber(i);
        const neighborSeatNumber =
          i % 2 === 0 && i + 1 < busCapacity
            ? (i + 2).toString()
            : i - 1 >= 0
            ? i.toString()
            : null;

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
    const busId = generateBusId();

    const bus = new Bus({
      busId,
      adminId,
      adminName,
      route,
      departureTime,
      arrivalTime,
      date,
      busCapacity,
      busDetails,
      seats,
      fare,
    });

    

    const createdBus = await bus.save();
    console.log("Bus created successfully:", createdBus);
    res.status(201).json(createdBus);
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    console.log("Retrieved buses:", buses);
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

// Update bus by ID
export const updateBus = async (req, res) => {
  const { id } = req.params;
  const {
    route,
    departureTime,
    arrivalTime,
    date,
    busCapacity,
    busDetails,
    fare,
  } = req.body;

  try {
    const bus = await Bus.findById(id);
    if (bus) {
      // Update bus properties
      bus.route = route || bus.route;
      bus.departureTime = departureTime || bus.departureTime;
      bus.arrivalTime = arrivalTime || bus.arrivalTime;
      bus.date = date || bus.date;
      bus.busCapacity = busCapacity || bus.busCapacity;
      bus.busDetails = busDetails || bus.busDetails;
      bus.fare = fare || bus.fare;

      const updatedBus = await bus.save();
      res.status(200).json(updatedBus);
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSeatStatusOfBus = async (req, res) => {
  const { busId, seatNumber, booked, email, gender } = req.body;

  try {
    // Find the bus by its ID
    const bus = await Bus.findOne({ busId });

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Find the seat to update
    const seat = bus.seats.find((s) => s.seatNumber === seatNumber);

    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
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

    // Save the updated bus document
    await bus.save();

    res.status(200).json({ message: "Seat status updated successfully", seat });
  } catch (error) {
    console.error("Error updating seat status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get buses by adminId or email
export const getBusesByAdminId = async (req, res) => {
  const { adminId, email } = req.query; // Use query parameters for adminId or email

  try {
    let buses;

    // If an email is provided, first fetch the adminId
    if (email) {
      const admin = await Admin.findOne({ email }); // Assuming the email field is unique
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      buses = await Bus.find({ adminId: admin._id }); // Use the adminId from the found admin
    } else if (adminId) {
      // If adminId is provided directly, fetch buses using that
      buses = await Bus.find({ adminId });
    } else {
      return res
        .status(400)
        .json({ message: "Either adminId or email must be provided" });
    }

    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
