import { Router } from "express";

import {
  addShow,
  getNowPlayingMovies,
  getShow,
  getShows,
  getTrendingMovies,
  getHomePageTrailers,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter: Router = Router();

// PUBLIC
showRouter.get("/trending", getTrendingMovies);
showRouter.get("/home-trailers", getHomePageTrailers);
showRouter.get("/all", getShows);
showRouter.get("/:movieId", getShow);

// ADMIN ONLY
showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShow);

export default showRouter;
