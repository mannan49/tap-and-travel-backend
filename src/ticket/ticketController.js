import Ticket from './ticketModel.js';
import Bus from '../bus/busModel.js';
import User from '../auth/user/userModel.js';

// Generate new ticket
export const generateTicket = async (req, res, next) => {
  const { userId, busId, seatNumber, travelDate } = req.body;

  try {
    // Ensure the bus exists and fetch its fare
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the seat is already booked
    const existingTicket = await Ticket.findOne({ busId, seatNumber, status: "booked" });
    if (existingTicket) return res.status(400).json({ message: "Seat is already booked." });

    // Create and save the ticket with fare fetched from the bus model
    const newTicket = new Ticket({
      userId,
      busId,
      seatNumber,
      fare: bus.fare,  // Use fare from bus
      travelDate,
      adminId: bus.adminId, // Get admin ID from the bus
    });

    const savedTicket = await newTicket.save();
    return res.status(201).json({ ticket: savedTicket });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Get all tickets for a user
export const getTicketsForUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const tickets = await Ticket.find({ userId }).populate('busId').populate('adminId');
    return res.status(200).json(tickets);
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Cancel a ticket
export const cancelTicket = async (req, res, next) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = 'cancelled';
    const updatedTicket = await ticket.save();
    return res.status(200).json({ message: "Ticket cancelled", ticket: updatedTicket });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};
