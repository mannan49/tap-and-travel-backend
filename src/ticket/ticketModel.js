import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
    min: 1,
  },
  fare: {
    type: Number,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  travelDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["booked", "cancelled", "scanned"],
    default: "booked",
  },
  ticketId: {
    type: String,
    unique: true,
  },
});

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
