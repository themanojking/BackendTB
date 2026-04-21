import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

/* ===================== CREATE APP FIRST ===================== */
const app = express();

/* ===================== CORS ===================== */
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://temple-tb.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ===================== SECURITY ===================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ===================== BODY ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== DB CONNECTION (AFTER APP INIT) ===================== */
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

/* ===================== RATE LIMIT ===================== */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api", limiter);

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

/* ===================== HEALTH ===================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ===================== 404 ===================== */
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ===================== EXPORT (NO app.listen) ===================== */
export default app;