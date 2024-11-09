import mongoose from "mongoose";

const BusDetailsSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
    },
    engineNumber: {
      type: String,
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
      enum: ["diesel", "electric"],
      required: true,
    },
    standard: {
      type: String,
      enum: ["economy", "business"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BusDetails = mongoose.model("BusDetails", BusDetailsSchema);
export default BusDetails;
