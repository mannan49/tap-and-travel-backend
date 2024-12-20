import BusEntity from "./busEntityModel.js";

// Create a new BusEntity
export const createBusEntity = async (req, res) => {
  try {
    const { adminId, busNumber, busCapacity, engineNumber, wifi, ac, fuelType, standard } = req.body;

    const newBusEntity = new BusEntity({
      adminId,
      busNumber,
      busCapacity,
      engineNumber,
      wifi,
      ac,
      fuelType,
      standard,
    });

    await newBusEntity.save();

    res.status(201).json({
      message: "Bus entity added successfully",
      busEntityId: newBusEntity._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBusEntitiesByAdminId = async (req, res) => {
  try {
    const { adminId } = req.query;
    const routes = await BusEntity.find({ adminId });
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all BusEntities
export const getAllBusEntities = async (req, res) => {
  try {
    const busEntities = await BusEntity.find();
    res.status(200).json(busEntities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a BusEntity by ID
export const getBusEntityById = async (req, res) => {
  try {
    const { id } = req.params;
    const busEntity = await BusEntity.findById(id);

    if (!busEntity) {
      return res.status(404).json({ message: "Bus entity not found" });
    }

    res.status(200).json(busEntity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a BusEntity
export const updateBusEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBusEntity = await BusEntity.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBusEntity) {
      return res.status(404).json({ message: "Bus entity not found" });
    }

    res.status(200).json({
      message: "Bus entity updated successfully",
      busEntity: updatedBusEntity,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a BusEntity
export const deleteBusEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBusEntity = await BusEntity.findByIdAndDelete(id);

    if (!deletedBusEntity) {
      return res.status(404).json({ message: "Bus entity not found" });
    }

    res.status(200).json({ message: "Bus entity deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
