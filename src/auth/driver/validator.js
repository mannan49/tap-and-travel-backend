import { body } from "express-validator";

const driverValidationRules = () => {
  return [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),

    body("email").isEmail().withMessage("Please provide a valid email address"),

    body("gender")
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be 'Male', 'Female', or 'Other'"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W]/)
      .withMessage("Password must contain at least one special character"),

    body("dob").isISO8601().withMessage("Date of birth must be a valid date"),

    body("phoneNumber")
      .matches(/^03[0-9]{9}$/)
      .withMessage('Phone number must be 11 digits and start with "03"'),

    body("cnicNumber")
      .matches(/^\d{13}$/)
      .withMessage("CNIC number must be exactly 13 digits"),

    body("adminId")
      .notEmpty()
      .withMessage("Admin ID is required")
      .isMongoId()
      .withMessage("Admin ID must be a valid MongoDB ID"),

    body("lastBusDrive")
      .optional()
      .isMongoId()
      .withMessage("Last Bus Drive must be a valid MongoDB ID"),
  ];
};

export default driverValidationRules;
