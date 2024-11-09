import { body } from "express-validator";

const busValidationRules = () => {
  return [
    body("adminId")
      .isMongoId()
      .withMessage("Admin ID must be a valid MongoDB Object ID"),

    // Validate route
    body("route")
      .exists()
      .withMessage("Route information is required")
      .isObject()
      .withMessage("Route must be an object"),

    body("route.startCity").notEmpty().withMessage("Start city is required"),

    body("route.endCity").notEmpty().withMessage("End city is required"),

    body("route.stops").isArray().withMessage("Stops must be an array"),

    body("date")
      .isISO8601()
      .toDate()
      .withMessage("Date must be a valid date format")
      .isAfter()
      .withMessage("Date must be in the future"),

    body("busCapacity")
      .isInt({ gt: 0 })
      .withMessage("Bus capacity must be a positive number"),

    body("busDetails")
      .exists()
      .withMessage("Bus details are required")
      .isObject()
      .withMessage("Bus details must be an object"),

    body("busDetails.busNumber")
      .notEmpty()
      .withMessage("Bus number is required"),

    body("busDetails.engineNumber")
      .notEmpty()
      .withMessage("Engine number is required"),

    body("busDetails.wifi")
      .isBoolean()
      .withMessage("Wifi must be a boolean value"),

    body("busDetails.ac").isBoolean().withMessage("AC must be a boolean value"),

    body("busDetails.fuelType")
      .isIn(["diesel", "electric"])
      .withMessage('Fuel type must be either "diesel" or "electric"'),

    body("busDetails.standard")
      .isIn(["executive", "business"])
      .withMessage('Standard must be either "executive" or "business"'),

    // Validate fare
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

    body("fare.paid")
      .isBoolean()
      .withMessage("Paid status must be a boolean value"),

    body("fare.paymentMedium")
      .optional()
      .isString()
      .withMessage("Payment medium must be a string"),
  ];
};

export { busValidationRules };
