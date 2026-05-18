import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isMongoDisabled = process.env.DISABLE_MONGODB === "true";

  if (isMongoDisabled) {
    console.warn("MongoDB is disabled by DISABLE_MONGODB=true.");
    return false;
  }

  if (!uri) {
    const message = "MONGODB_URI is not set";

    if (isDevelopment) {
      console.warn(`${message}. Starting server without MongoDB.`);
      return false;
    }

    throw new Error(message);
  }

  try {
    await mongoose.connect(uri, {
      dbName: "jsd12-express-app",
      serverSelectionTimeoutMS: 5000,
    });
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    if (isDevelopment) {
      console.warn("Continuing without MongoDB because NODE_ENV is not production.");
      return false;
    }

    throw err;
  }
}
