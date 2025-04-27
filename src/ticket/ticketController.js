import Ticket from "./ticketModel.js";
import Bus from "../bus/busModel.js";
import User from "../auth/user/userModel.js";
import Admin from "../auth/admin/adminModel.js";

// Generate new ticket
export const generateTickets = async (req, res, next) => {
  const { tickets } = req.body;

  console.log("Req", req.body);

  try {
    const createdTickets = [];

    for (let ticketData of tickets) {
      const { userId, busId, seatNumber } = ticketData;

      // Ensure the bus exists and fetch its fare
      const bus = await Bus.findById(busId);
      if (!bus)
        return res
          .status(404)
          .json({ message: `Bus with ID ${busId} not found` });

      // Ensure the user exists
      const user = await User.findById(userId);
      if (!user)
        return res
          .status(404)
          .json({ message: `User with ID ${userId} not found` });

      // Check if the seat is already booked
      const existingTicket = await Ticket.findOne({
        busId,
        seatNumber,
        status: "booked",
      });
      if (existingTicket)
        return res.status(400).json({
          message: `Seat ${seatNumber} on bus ${busId} is already booked.`,
        });

      // Create and save the ticket with fare fetched from the bus model
      const newTicket = new Ticket({
        userId,
        busId,
        seatNumber,
        fare: bus.fare.actualPrice,
        travelDate: bus.date,
        adminId: bus.adminId,
        ticketId: `TICKET-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)}`,
      });
      const savedTicket = await newTicket.save();
      createdTickets.push(savedTicket);
    }

    return res.status(201).json({ tickets: createdTickets });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};
// Get all tickets for a user
export const getTicketsForUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const tickets = await Ticket.find({ userId })
      .populate("busId")
      .populate("adminId");
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

    ticket.status = "cancelled";
    const updatedTicket = await ticket.save();
    return res
      .status(200)
      .json({ message: "Ticket cancelled", ticket: updatedTicket });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

export const getTicketInformation = async (req, res, next) => {
  const { RFIDCardNumber, busId } = req.body;
  let userId = req.params.userId || req.body.userId;

  try {
    let userIdToFetch = userId;

    // If RFIDCardNumber is provided, fetch the userId using it
    if (RFIDCardNumber) {
      const user = await User.findOne({ RFIDCardNumber });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with the provided RFIDCardNumber." });
      }
      userIdToFetch = user._id;
    }

    if (!userIdToFetch) {
      return res.status(400).json({ message: "UserId is required." });
    }

    // Build ticket query dynamically
    const ticketQuery = { userId: userIdToFetch };
    if (busId) {
      ticketQuery.busId = busId;
    }

    const tickets = await Ticket.find(ticketQuery);
    if (!tickets.length) {
      return res
        .status(404)
        .json({ message: "No tickets found for this user." });
    }

    const ticketInformation = await Promise.all(
      tickets.map(async (ticket) => {
        const [user, admin, bus] = await Promise.all([
          User.findById(ticket.userId),
          Admin.findById(ticket.adminId),
          Bus.findById(ticket.busId),
        ]);

        if (!user || !admin || !bus) {
          throw new Error("Missing related information for ticket.");
        }

        return {
          userId: user._id,
          busId: bus._id,
          adminId: admin._id,
          user: user.name,
          phoneNumber: user.phoneNumber,
          adminName: admin?.company,
          route: bus?.route,
          fare: bus?.fare,
          busDetails: bus?.busDetails,
          departureTime: bus?.departureTime,
          arrivalTime: bus?.arrivalTime,
          busCapacity: bus.capacity,
          seatNumber: ticket.seatNumber,
          date: ticket.travelDate,
        };
      })
    );

    res.status(200).json(ticketInformation);
  } catch (err) {
    next({ status: 500, message: err.message });
  }
};
