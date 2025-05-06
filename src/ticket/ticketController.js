import Ticket from "./ticketModel.js";
import Bus from "../bus/busModel.js";
import User from "../auth/user/userModel.js";
import Admin from "../auth/admin/adminModel.js";
import { sendPushNotification } from "../helpers/notificationHelper.js";
import {
  scheduleNotification,
  scheduleRouteStopNotifications,
} from "../helpers/scheduler.js";
import moment from "moment";

const notifyUserOnBooking = async (userId, bus) => {
  const user = await User.findById(userId);
  if (user?.fcmToken) {
    await sendPushNotification(
      user.fcmToken,
      "Booking Confirmed",
      `Your seat for ${bus?.route?.startCity} to ${bus?.route?.endCity} is booked.`
    );
  }
};

export const scheduleRouteNotifications = async (req, res) => {
  const { userId, busId, currentLocation, route } = req.body;

  try {
    const user = await User.findById(userId);
    const bus = await Bus.findById(busId);
    if (!user || !user.fcmToken || !bus) {
      return res.status(404).json({ message: "User or bus not found" });
    }

    await scheduleRouteStopNotifications(user, bus, currentLocation, route);
    return res.status(200).json({ message: "Stop notifications scheduled" });
  } catch (err) {
    console.error("Scheduling error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const generateNotification = async (req, res, next) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  try {
    if (user?.fcmToken) {
      await sendPushNotification(user.fcmToken, "Booking Confirmed Bhai");
    }
    return res.status(201).json({ message: "Notification Sent" });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

// Generate new ticket
export const generateTickets = async (req, res, next) => {
  const { tickets } = req.body;
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
      await notifyUserOnBooking(userId, bus);
      await scheduleNotification(user, bus);
    }
    res.locals.logEvent = {
      eventName: "TicketBooked",
      payload: tickets,
    };
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

    if (RFIDCardNumber) {
      const user = await User.findOne({ RFIDCardNumber });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with the provided RFIDCardNumber." });
      }
      userIdToFetch = user._id;

      const updateQuery = { userId: userIdToFetch };
      if (busId) {
        updateQuery.busId = busId;
      }

      await Ticket.updateMany(updateQuery, { status: "scanned" });
    }

    if (!userIdToFetch) {
      return res.status(400).json({ message: "UserId is required." });
    }

    const ticketQuery = { userId: userIdToFetch };
    if (busId) {
      ticketQuery.busId = busId;
    }

    const tickets = await Ticket.find(ticketQuery);
    if (!tickets.length) {
      return res
        .status(201)
        .json({ message: "No tickets found for this user." });
    }

    const ticketInformation = await Promise.all(
      tickets.map(async (ticket) => {
        const [user, admin, bus] = await Promise.all([
          User.findById(ticket.userId),
          Admin.findById(ticket.adminId),
          Bus.findById(ticket.busId),
        ]);

        // If bus is missing, skip this ticket
        if (!bus) return null;

        const seatDetails = bus?.seats?.find(
          (seat) => seat?.seatNumber === ticket?.seatNumber
        );

        // If seatDetails are missing, skip this ticket
        if (!seatDetails) return null;

        return {
          _id: ticket?._id,
          userId: user?._id,
          busId: bus._id,
          adminId: admin?._id,
          user: user?.name,
          phoneNumber: user?.phoneNumber,
          adminName: admin?.company,
          route: bus?.route,
          fare: bus?.fare,
          busDetails: bus?.busDetails,
          departureTime: bus?.departureTime,
          arrivalTime: bus?.arrivalTime,
          busCapacity: bus?.capacity,
          seatNumber: ticket?.seatNumber,
          seatDetails,
          date: ticket?.travelDate,
          ticketStatus: ticket?.status,
          endDate: bus?.endDate,
          busStatus: bus?.status,
        };
      })
    );

    const validTickets = ticketInformation.filter((t) => t !== null);
    const now = moment.utc();
    const active = validTickets
      .filter((ticket) => moment.utc(ticket.date).isAfter(now))
      .sort((a, b) => moment.utc(b.date).diff(moment.utc(a.date)));

    const past = validTickets
      .filter((ticket) => moment.utc(ticket.date).isSameOrBefore(now))
      .sort((a, b) => moment.utc(b.date).diff(moment.utc(a.date)));

    res.status(200).json({
      active,
      past,
    });
  } catch (err) {
    next({ status: 500, message: err.message });
  }
};
