import moment from "moment";

export function calculateEndDate(date, arrivalTime) {
  return moment(`${date.split("T")[0]} ${arrivalTime}`, "YYYY-MM-DD HH:mm").toISOString();
}
