import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { validateBooking } from "../middleware/validate.js";

const router = express.Router();

// Protected user routes
router.post("/", protect, validateBooking, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/cancel", protect, cancelBooking);

// Admin routes
router.get("/", protect, adminOnly, getAllBookings);

export default router;
