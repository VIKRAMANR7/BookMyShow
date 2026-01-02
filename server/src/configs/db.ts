import mongoose from "mongoose";

export async function connectDB() {
  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(`${MONGO_URI}/bookmyshow`);
  console.log("MongoDB connected");
}

export default connectDB;
