import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI; // ✅ move inside

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI missing. ENV:", process.env);
    throw new Error("MONGO_URI is not defined");
  }

  if (cached.conn) {
    console.log("⚡ Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected");
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;