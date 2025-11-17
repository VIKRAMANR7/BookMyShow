import mongoose from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
}

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
