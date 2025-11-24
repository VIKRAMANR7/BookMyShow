import type { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

export const protectAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const user = await clerkClient.users.getUser(userId);
    const role = user.privateMetadata?.role;

    if (role !== "admin") {
      res.status(403).json({ success: false, message: "Admins only" });
      return;
    }

    next();
  } catch {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
