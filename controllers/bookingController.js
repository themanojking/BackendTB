import Booking from "../models/Booking.js";

// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      templeId, templeName, slot, slotTime,
      visitDate, visitors, totalAmount,
      visitorName, email, phone,
    } = req.body;

    const booking = await Booking.create({
      user: req.user._id,
      templeId,
      templeName,
      slot,
      slotTime,
      visitDate,
      visitors,
      totalAmount,
      visitorName,
      email,
      phone,
      status: "confirmed",
    });

    res.status(201).json({
      message: "Booking confirmed!",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: error.message || "Booking failed" });
  }
};

// @route   GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Check if visit date is within 24 hours
    const visitDate = new Date(booking.visitDate);
    const now = new Date();
    const diffHours = (visitDate - now) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return res.status(400).json({
        message: "Cannot cancel booking within 24 hours of visit",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/bookings/all (admin)
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Booking.countDocuments(query);
    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
