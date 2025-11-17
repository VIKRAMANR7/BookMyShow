import { Router } from "express";

import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";

const userRouter: Router = Router();

userRouter.get("/bookings", getUserBookings);
userRouter.post("/update-favorite", updateFavorite);
userRouter.get("/favorites", getFavorites);

export default userRouter;
