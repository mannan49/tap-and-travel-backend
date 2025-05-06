import stripe from "stripe";
import Bus from "../bus/busModel.js";
import User from "../auth/user/userModel.js";
import Admin from "../auth/admin/adminModel.js";
import Payment from "./paymentModel.js";
import config from "../config/index.js";

const stripeInstance = stripe(config.STRIPE_SECRET_KEY);

// Function to validate IDs in the database
const validateEntities = async (busId, userId, adminId) => {
  const bus = await Bus.findById(busId);
  const user = await User.findById(userId);
  const admin = await Admin.findById(adminId);

  if (!bus) throw new Error("Bus ID does not exist.");
  if (!user) throw new Error("User ID does not exist.");
  if (!admin) throw new Error("Admin ID does not exist.");
};

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, busId, userId, adminId } = req.body;

    // Validate entities
    await validateEntities(busId, userId, adminId);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount * 100,
      currency: currency || "INR",
      metadata: { busId, userId, adminId },
    });

    const paymentRecord = new Payment({
      paymentId: paymentIntent.id,
      userId,
      busId,
      adminId,
      amount,
      currency: currency || "INR",
      status: "pending",
    });

    await paymentRecord.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      userId: userId,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { paymentId, status } = req.body;

  try {
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = status;
    payment.updatedAt = new Date();

    await payment.save();

    res.status(200).json({ message: "Payment status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Webhook to handle payment confirmation
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Update payment status in the database
    await Payment.findOneAndUpdate(
      { paymentId: paymentIntent.id },
      { status: "succeeded" }
    );
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    // Update payment status in the database
    await Payment.findOneAndUpdate(
      { paymentId: paymentIntent.id },
      { status: "failed" }
    );
  }

  res.json({ received: true });
};

export const getPaymentsBySearchFilter = async (req, res) => {
  try {
    const { adminId, ...filters } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "AdminId is required." });
    }

    const query = { adminId, ...filters };

    const payments = await Payment.aggregate([
      { $match: query },
      {
        $addFields: {
          userIdObj: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userIdObj",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $addFields: {
          userName: { $arrayElemAt: ["$userInfo.name", 0] },
          userEmail: { $arrayElemAt: ["$userInfo.email", 0] },
        },
      },
      { $project: { userInfo: 0, userIdObj: 0 } },
    ]);

    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      message: "Payments retrieved successfully.",
      total,
      data: payments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving payment", error: error.message });
  }
};
