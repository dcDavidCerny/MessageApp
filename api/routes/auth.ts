import express from "express";
import { authenticate } from "../middleware/auth.js";
import { UserModel } from "../models/user.js";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", async (req, res): Promise<void> => {
  try {
    const { username, email, password, displayName } = req.body;

    // Check that all required fields are filled
    if (!username || !email || !password || !displayName) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Create new user
    const result = await UserModel.create({
      username,
      email,
      password,
      displayName,
      friendIds: [],
      friendRequestUserIds: [],
    });

    // Set token in cookies
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res
      .status(201)
      .json({ user: result.user, message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error);
    if ((error as Error).message === "Email already exists") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Server failed during registration" });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post("/login", async (req, res): Promise<void>  => {
  try {
    const { email, password } = req.body;

    // Check that all fields are filled
    if (!email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return
    }

    // Authenticate user
    const result = await UserModel.authenticate(email, password);

    if (!result) {
      res.status(401).json({ error: "Invalid email or password" });
      return
    }

    // Set token in cookies
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ user: result.user, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server failed during login" });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post("/logout", authenticate, async (req, res): Promise<void>  => {
  try {
    await UserModel.logout(req.token);

    // Delete token from cookies
    res.clearCookie("accessToken");

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Server failed during logout" });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify token validity
 * @access Public
 */
router.get("/verify", async (req, res): Promise<void>  => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      res.json({ valid: false });
      return;
    }

    const user = await UserModel.getUserByToken(token);

    if (!user) {
      res.clearCookie("accessToken");
      res.json({ valid: false });
      return;
    }

    res.json({ valid: true, user });
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(500).json({ error: "Server failed during token verification" });
  }
});

export default router;
