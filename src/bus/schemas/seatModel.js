import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    booked: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    neighborGender: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Seat = mongoose.model("Seat", SeatSchema);
export default Seat;
