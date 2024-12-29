import { body } from "express-validator";

const userValidationRules = () => {
  return [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W]/)
      .withMessage("Password must contain at least one special character"),
    body("phoneNumber")
      .matches(/^03[0-9]{9}$/)
      .withMessage('Phone number must be 11 digits and start with "03"'),
    body("company")
      .optional()
      .notEmpty()
      .withMessage("Company name is required"),
  ];
};

const passwordValidationRules = () => {
  return [
      body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W]/)
      .withMessage("Password must contain at least one special character"),
  ];
};

const loginValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
    body("RFIDCardNumber")
      .if((value, { req }) => !req.body.email && !req.body.password)
      .notEmpty()
      .withMessage("RFIDCardNumber is required when logging in with RFID"),
  ];
};

export { userValidationRules, loginValidationRules, passwordValidationRules };
