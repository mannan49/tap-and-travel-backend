import moment from "moment-timezone";

export function calculateEndDate(date, departureTime, arrivalTime) {
  const baseDate = date.split("T")[0];
  const departure = moment.tz(`${baseDate} ${departureTime}`, "YYYY-MM-DD HH:mm", "Asia/Karachi");
  let arrival = moment.tz(`${baseDate} ${arrivalTime}`, "YYYY-MM-DD HH:mm", "Asia/Karachi");
  if (arrival.isBefore(departure)) {
    arrival.add(1, "day");
  }
  return arrival.utc().toDate();
}
