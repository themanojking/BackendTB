import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  // ✅ Reuse existing connection (VERY IMPORTANT for Vercel)
  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    isConnected = conn.connections[0].readyState;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    // ❗ DO NOT use process.exit in Vercel
    throw error;
  }
};

export default connectDB;