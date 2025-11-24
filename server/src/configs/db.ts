import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

export async function connectDB(): Promise<void> {
  if (!MONGO_URI) {
    console.error("MONGODB_URI is missing in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(`${MONGO_URI}/bookmyshow`);
    console.log("MongoDB connected");
  } catch {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
  }
}

export default connectDB;
