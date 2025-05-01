// agenda.js
import { Agenda } from "agenda";
import mongoose from "mongoose";
import User from "./src/auth/user/userModel.js";
import Bus from "./src/bus/busModel.js";
import { sendPushNotification } from "./src/helpers/notificationHelper.js";
import config from "./src/config/index.js";
import moment from "moment";

const agenda = new Agenda({
  db: { address: config.MONGO_URI, collection: "scheduledJobs" },
  processEvery: "30 seconds",
});

agenda.define("sendBusDepartureNotification", async (job) => {
  const { userId, busId } = job.attrs.data;

  const user = await User.findById(userId);
  const bus = await Bus.findById(busId);

//   format departure time in formar 9:00 PM or AM

  if (user?.fcmToken && bus) {
    const formattedTime = moment(bus?.departureTime, "HH:mm").format("h:mm A");
    await sendPushNotification(
      user.fcmToken,
      "Bus Departure Reminder",
      `Your bus from ${bus.route.startCity} to ${bus.route.endCity} departs at ${formattedTime}. Be ready!`
    );
  }
});

export default agenda;
