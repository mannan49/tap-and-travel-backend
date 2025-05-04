import axios from "axios";
import moment from "moment";
import agenda from "../../agenda.js";
import config from "../config/index.js";

export const scheduleNotification = async (user, bus) => {
  const departureDate = new Date(bus?.date);
  const [hours, minutes] = bus.departureTime.split(":").map(Number);

  departureDate.setHours(hours, minutes, 0, 0);

  const notifyTime = new Date(departureDate.getTime() - 30 * 60 * 1000);

  const now = new Date();

  const isFutureDate = departureDate.toDateString() !== now.toDateString();
  const isTodayButTimeFuture =
    departureDate.toDateString() === now.toDateString() && departureDate > now;

  if (isFutureDate || isTodayButTimeFuture) {
    await agenda.schedule(notifyTime, "sendBusDepartureNotification", {
      userId: user._id,
      busId: bus._id,
    });
  }
};

export const scheduleRouteStopNotifications = async (
  user,
  bus,
  currentLocation,
  route
) => {
  const stops = route.stops;

  for (let i = 1; i < stops.length; i++) {
    const stop = stops[i];
    const isFinalStop = i === stops.length - 1;

    const stopLocation = `${stop.geometry.location.lat},${stop.geometry.location.lng}`;
    const userLocation = `${currentLocation.lat},${currentLocation.lng}`;

    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation}&destination=${stopLocation}&key=${config.GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(directionsUrl);
    const routeData = response.data.routes?.[0];
    if (!routeData) continue;

    const durationInSeconds = routeData.legs?.[0]?.duration?.value || 0;
    const etaInMs = durationInSeconds * 1000;
    const scheduleTime = moment()
      .add(etaInMs - 15 * 60 * 1000, "milliseconds")
      .toDate();

    const title = isFinalStop ? "Arrival Station" : "Rest Area Stop";
    const body = isFinalStop
      ? `We are about to reach our destination (${stop.name}) shortly. We hope you liked our service.`
      : `We are about to reach ${
          stop.name
        } shortly. There is a scheduled stop here for ${
          stop.duration || 10
        } minutes.`;

    const existingJob = await agenda._collection.findOne({
      name: "sendRouteStopNotification",
      "data.userId": user._id,
      "data.busId": bus._id,
      "data.title": title,
      "data.body": body,
    });

    if (existingJob) {
      continue;
    }

    await agenda.schedule(scheduleTime, "sendRouteStopNotification", {
      userId: user._id,
      busId: bus._id,
      fcmToken: user.fcmToken,
      title,
      body,
    });
  }
};
