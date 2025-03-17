import express from "express";
import { authenticate } from "../middleware/auth.js";
import { UserModel } from "../models/user.js";
import { User } from "../types.js";

const router = express.Router();

/**
 * @route GET /api/users/me
 * @desc Get the current user's profile
 * @access Private
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Server failed to retrieve user" });
  }
});

/**
 * @route PUT /api/users/me
 * @desc Update the current user's profile
 * @access Private
 */
router.put("/me", authenticate, async (req, res): Promise<void> => {
  try {
    const { displayName, avatarUrl } = req.body;
    const updateData: Partial<User> = {};

    if (displayName !== undefined) updateData.displayName = displayName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updatedUser = await UserModel.update(req.user.id, updateData);

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server failed to update user" });
  }
});

/**
 * @route PUT /api/users/password
 * @desc Change user password
 * @access Private
 */
router.put("/password", authenticate, async (req, res): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: "Both old and new passwords are required" });
      return;
    }

    // Verify old password
    const isAuthenticated = await UserModel.authenticate(req.user.email, oldPassword);

    if (!isAuthenticated) {
      res.status(401).json({ error: "Invalid old password" });
      return;
    }

    // Update password
    await UserModel.updatePassword(req.user.id, newPassword);

    res.json({ message: "Password successfully changed" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Server failed to change password" });
  }
});

/**
 * @route GET /api/users/search
 * @desc Search for users by name
 * @access Private
 */
router.get("/search", authenticate, async (req, res): Promise<void> => {
  try {
    const searchQuery = req.query.query as string;

    if (!searchQuery || searchQuery.length < 2) {
      res.status(400).json({ error: "Search query must be at least 2 characters long" });
      return;
    }

    const users = await UserModel.searchUsers(searchQuery);

    // Filter out the current user's account from results
    const filteredUsers = users.filter((user) => user.id !== req.user.id);

    res.json(filteredUsers);
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Server failed to search for users" });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get("/:id", authenticate, async (req, res): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Server failed to retrieve user" });
  }
});

export default router;
