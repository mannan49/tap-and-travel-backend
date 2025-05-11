import mongoose from "mongoose";

const BusEntitySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required."],
    },
    busNumber: {
      type: String,
      unique: true,
      required: true,
    },
    busCapacity: {
      type: String,
      required: true,
    },
    engineNumber: {
      type: String,
      unique: true,
      required: true,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    ac: {
      type: Boolean,
      default: false,
    },
    fuelType: {
      type: String,
      default: "diesel",
      enum: ["diesel", "electric"],
    },
    standard: {
      type: String,
      default: "executive",
      enum: ["economy", "executive", "business"],
    },
    imageSrc: {
      type: String,
    },
  },
  { timestamps: true }
);

const BusEntity = mongoose.model("Bus-Entity", BusEntitySchema);

export default BusEntity;
