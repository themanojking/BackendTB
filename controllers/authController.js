import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone });
    console.log("User created:", user);

    const token = generateToken(user._id);
    console.log("Token created");

    res.status(201).json({ message: "Success", token });
  } catch (error) {
    console.error("🔥 FULL REGISTER ERROR:", error);
    res.status(500).json({ message: error.message }); // IMPORTANT
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true },
    );
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
