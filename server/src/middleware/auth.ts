import type { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

import { AppError } from "../server.js";

export async function protectAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return next(new AppError("Unauthorized", 401));
    }

    const user = await clerkClient.users.getUser(userId);

    const role = user.privateMetadata?.role;

    if (role !== "admin") {
      return next(new AppError("Forbidden: Admins only", 403));
    }

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
}
