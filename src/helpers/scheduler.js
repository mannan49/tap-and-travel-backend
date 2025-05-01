import agenda from "../../agenda.js";

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
