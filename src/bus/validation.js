import { body } from "express-validator";
import moment from "moment";

const busValidationRules = () => {
  return [
    body("adminId")
      .isMongoId()
      .withMessage("Admin ID must be a valid MongoDB Object ID"),

    // Validate date separately
    body("date")
      .isISO8601()
      .withMessage("Date must be a valid date format")
      .custom((dateValue) => {
        const today = moment().startOf("day");
        const selectedDate = moment(dateValue, "YYYY-MM-DD");

        if (!selectedDate.isValid()) {
          throw new Error("Invalid date format.");
        }

        if (selectedDate.isBefore(today)) {
          throw new Error("Date must be today or a future date.");
        }

        return true;
      }),

    // // Validate departureTime separately
    body("departureTime").custom((departureTimeValue, { req }) => {
      const { date } = req.body;

      if (!date) {
        throw new Error("Date is required to validate departure time.");
      }

      const today = moment().format("YYYY-MM-DD");

      if (date === today) {
        const now = moment();
        const departureTimeToday = moment(
          `${today} ${departureTimeValue}`,
          "YYYY-MM-DD HH:mm"
        );

        if (!departureTimeToday.isValid()) {
          throw new Error("Invalid departure time format.");
        }

        if (departureTimeToday.isBefore(now)) {
          throw new Error("Departure time must be in the future for today.");
        }
      }

      return true;
    }),
    body("fare")
      .exists()
      .withMessage("Fare information is required")
      .isObject()
      .withMessage("Fare must be an object"),

    body("fare.actualPrice")
      .isFloat({ gt: 0 })
      .withMessage("Actual price must be a positive number"),

    body("fare.discount")
      .isFloat({ gte: 0 })
      .withMessage("Discount must be a non-negative number"),

    body("fare.promoCode")
      .optional()
      .isString()
      .withMessage("Promo code must be a string"),
  ];
};

export { busValidationRules };
