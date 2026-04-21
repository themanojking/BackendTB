import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE FIRST

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "../config/db.js";
import authRoutes from "../routes/auth.js";
import bookingRoutes from "../routes/bookings.js";
import paymentRoutes from "../routes/payment.js";

const app = express();

/* ✅ CONNECT DB ONCE */
connectDB();

/* ✅ MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: "*", // or your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
/* ✅ RATE LIMIT */
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

/* ✅ ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

/* ✅ HEALTH */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ✅ LOCAL SERVER ONLY */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;