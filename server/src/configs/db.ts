import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI || "";

export async function connectDB(): Promise<void> {
  if (!MONGO_URI) {
    throw new Error("❌ MONGODB_URI is missing in environment variables.");
  }

  try {
    const connectionInstance = await mongoose.connect(`${MONGO_URI}/bookmyshow`, {
      maxPoolSize: 10,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
    });

    console.log(
      `\n📦 MongoDB Connected Successfully!\nDB Host: ${connectionInstance.connection.host}`
    );

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected. Retrying in 5 seconds...");
      setTimeout(() => {
        void connectDB();
      }, 5000);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

export default connectDB;
