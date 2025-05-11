import { body } from "express-validator";

const userValidationRules = () => {
  return [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
      body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .custom((value) => {
        const allowedPattern = /^[a-zA-Z0-9@.]+$/;
        if (!allowedPattern.test(value)) {
          throw new Error("Email should not contain special characters except '@' and '.'");
        }
        return true;
      }),    
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
    body("password").notEmpty().withMessage("Password is required")
      .if((value, { req }) => !req.body.email && !req.body.password)
      .notEmpty()
  ];
};

export { userValidationRules, loginValidationRules, passwordValidationRules };
