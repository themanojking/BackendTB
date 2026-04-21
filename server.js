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

// Connect DB
connectDB();

const app = express();

/* ===================== ✅ CORS FIRST (VERY IMPORTANT) ===================== */
app.use(cors({
  origin: ["http://localhost:5173", "https://temple-tb.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Handle preflight
app.options("*", cors());

/* ===================== SECURITY ===================== */
app.use(helmet());

/* ===================== BODY ===================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===================== RATE LIMIT ===================== */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again later." },
});

// ✅ Apply AFTER CORS
app.use("/api", limiter);

// ✅ Allow OPTIONS to bypass limiter
app.use("/api/auth/login", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  authLimiter(req, res, next);
});

app.use("/api/auth/register", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  authLimiter(req, res, next);
});

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

/* ===================== HEALTH ===================== */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Thanjai Devasthanams API is running 🙏",
    timestamp: new Date().toISOString(),
  });
});

/* ===================== 404 ===================== */
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ===================== ERROR ===================== */
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});