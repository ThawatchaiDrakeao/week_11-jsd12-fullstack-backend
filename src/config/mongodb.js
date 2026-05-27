import mongoose from "mongoose";

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri, { dbName: "jsd12-express-app" });
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error ❌", err);
    // process.exit(1);
    throw err;
  }
}
