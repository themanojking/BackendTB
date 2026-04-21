import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

export const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),

  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),

  body("phone")
    .matches(/^\+?[6-9]\d{9}$/).withMessage("Valid 10-digit Indian phone number required"),

  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email is required"),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

export const validateBooking = [
  body("templeId").isNumeric().withMessage("Valid temple ID required"),
  body("templeName").notEmpty().withMessage("Temple name is required"),
  body("slot").notEmpty().withMessage("Slot is required"),
  body("slotTime").notEmpty().withMessage("Slot time is required"),
  body("visitDate").isISO8601().withMessage("Valid date is required"),
  body("visitors")
    .isInt({ min: 1, max: 10 }).withMessage("Visitors must be between 1 and 10"),
  body("totalAmount").isNumeric().withMessage("Valid amount required"),
  body("visitorName").notEmpty().withMessage("Visitor name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("phone").notEmpty().withMessage("Phone number is required"),

  handleValidationErrors,
];
