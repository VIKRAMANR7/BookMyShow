import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const MONGO_URI = process.env.MONGODB_URI!;

  try {
    await mongoose.connect(`${MONGO_URI}/bookmyshow`);
    console.log("MongoDB connected");
  } catch {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
  }
}

export default connectDB;
