import Bus from "./busModel.js";

// Add new bus
export const addBus = async (req, res) => {
  const { adminId, startLocation, endLocation, departureTime, arrivalTime, date, busCapacity, busDetails, fare } = req.body;

  try {
    const bus = new Bus({
      adminId,
      startLocation,
      endLocation,
      departureTime,
      arrivalTime,
      date,
      busCapacity,
      busDetails,
      fare,
    });

    const createdBus = await bus.save();
    res.status(201).json(createdBus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single bus by ID
export const getBusById = async (req, res) => {
  const { id } = req.params;

  try {
    const bus = await Bus.findById(id);
    if (bus) {
      res.status(200).json(bus);
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete bus by ID
export const deleteBus = async (req, res) => {
  const { id } = req.params;

  try {
    const bus = await Bus.findByIdAndDelete(id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    return res.status(200).json({ message: 'Bus deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update bus by ID
export const updateBus = async (req, res) => {
  const { id } = req.params;
  const { startLocation, endLocation, departureTime, arrivalTime, date, busCapacity, busDetails, fare } = req.body;

  try {
    const bus = await Bus.findById(id);
    if (bus) {
      bus.startLocation = startLocation || bus.startLocation;
      bus.endLocation = endLocation || bus.endLocation;
      bus.departureTime = departureTime || bus.departureTime;
      bus.arrivalTime = arrivalTime || bus.arrivalTime;
      bus.date = date || bus.date;
      bus.busCapacity = busCapacity || bus.busCapacity;
      bus.busDetails = busDetails || bus.busDetails;
      bus.fare = fare || bus.fare;

      const updatedBus = await bus.save();
      res.status(200).json(updatedBus);
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
