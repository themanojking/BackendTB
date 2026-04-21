import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templeId: {
      type: Number,
      required: [true, "Temple ID is required"],
    },
    templeName: {
      type: String,
      required: [true, "Temple name is required"],
    },
    slot: {
      type: String,
      required: [true, "Slot is required"],
    },
    slotTime: {
      type: String,
      required: [true, "Slot time is required"],
    },
    visitDate: {
      type: Date,
      required: [true, "Visit date is required"],
      validate: {
        validator: function (v) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v >= today;
        },
        message: "Visit date cannot be in the past",
      },
    },
    visitors: {
      type: Number,
      required: true,
      min: [1, "At least 1 visitor required"],
      max: [10, "Maximum 10 visitors per booking"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    visitorName: {
      type: String,
      required: [true, "Visitor name is required"],
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    paymentId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: "ONLINE",
    },
    bookingReference: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate booking reference
bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    this.bookingReference = `TDV${Date.now().toString().slice(-8)}${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
