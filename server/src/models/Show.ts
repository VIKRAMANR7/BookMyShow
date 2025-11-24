import mongoose from "mongoose";

export interface IShow {
  _id: string;
  movie: string;
  showDateTime: Date;
  showPrice: number;
  occupiedSeats: Record<string, string>;
}

const showSchema = new mongoose.Schema<IShow>(
  {
    movie: { type: String, required: true, ref: "Movie" },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true }
);

const Show = mongoose.model<IShow>("Show", showSchema);

export default Show;
