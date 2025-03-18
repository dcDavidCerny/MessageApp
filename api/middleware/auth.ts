import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.js";
import { User } from "../types.js";

// Extend Express Request interface to include user

declare module "express-serve-static-core" {
  interface Request {
    user: Omit<User, "password">;
    token: string;
  }
}

/**
 * Middleware to authenticate users by token stored in cookies
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      console.error("No token provided");
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await UserModel.getUserByToken(token);

    if (!user) {
      console.error("Invalid or expired token: " + token);
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Add user and token to request for use in route handlers
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};

/**
 * Optional authentication - doesn't return error if no token provided
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const user = await UserModel.getUserByToken(token);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
