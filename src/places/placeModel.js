import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
    },
    results: {
      type: Array,
      required: true,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "OK",
    },
  },
  { timestamps: true }
);

export const Place = mongoose.model("Place", placeSchema);
