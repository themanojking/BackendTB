import express from "express";
import crypto from "crypto";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/payment/verify
// Verify Razorpay payment signature server-side
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during payment verification" });
  }
});

// @route   POST /api/payment/create-order
// Create Razorpay order (for server-side order creation flow)
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    // Dynamically import razorpay only if key is configured
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

export default router;
