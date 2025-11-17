import mongoose from "mongoose";

export interface IMovieGenre {
  id: number;
  name: string;
}

export interface IMovieCast {
  id: number;
  name: string;
  profile_path?: string;
  character?: string;
}

export interface IMovie {
  _id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  original_language?: string;
  tagline?: string;
  genres: IMovieGenre[];
  casts: IMovieCast[];
  vote_average: number;
  runtime: number;
}

const movieSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    overview: { type: String, required: true },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_date: { type: String, required: true },
    original_language: String,
    tagline: String,
    genres: [{ id: Number, name: String }],
    casts: [{ id: Number, name: String, profile_path: String, character: String }],
    vote_average: { type: Number, required: true },
    runtime: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>("Movie", movieSchema);
