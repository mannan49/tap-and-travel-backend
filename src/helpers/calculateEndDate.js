import moment from "moment";

export function calculateEndDate(date, departureTime, arrivalTime) {
  const baseDate = date.split("T")[0];
  const departure = moment(`${baseDate} ${departureTime}`, "YYYY-MM-DD HH:mm");
  let arrival = moment(`${baseDate} ${arrivalTime}`, "YYYY-MM-DD HH:mm");
  if (arrival.isBefore(departure)) {
    arrival.add(1, "day");
  }
  return arrival.format("YYYY-MM-DDTHH:mm:ssZ");
}
