import express from "express";
import { authenticate } from "../middleware/auth.js";
import { UserModel } from "../models/user.js";
import { usersWithNewItems } from "../server.js";

const router = express.Router();

/**
 * @route GET /api/friends
 * @desc Get current user's friends list
 * @access Private
 */
router.get("/", authenticate, async (req, res): Promise<void> => {
  try {
    const friends = await UserModel.getFriends(req.user.id);

    if (!friends) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Server failed to fetch friends" });
  }
});

/**
 * @route POST /api/friends/requests/:userId
 * @desc Send a friend request
 * @access Private
 */
router.post(
  "/requests/:userId",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const receiverId = req.params.userId;

      // Check that user is not sending request to themselves
      if (receiverId === req.user.id) {
        res.status(400).json({ error: "You cannot send a request to yourself" });
        return;
      }

      const result = await UserModel.sendFriendRequest(
        req.user.id,
        receiverId
      );

      if (!result) {
        res.status(400).json({
          error:
            "Cannot send request. User either doesn't exist, request already sent, or you're already friends.",
        });
        return;
      }

      // Add recipient to users with updates list
      usersWithNewItems.add(receiverId);

      res.json({ message: "Friend request sent successfully" });
    } catch (error) {
      console.error("Error sending friend request:", error);
      res
        .status(500)
        .json({ error: "Server failed to send friend request" });
    }
  }
);

/**
 * @route GET /api/friends/requests
 * @desc Get incoming friend requests
 * @access Private
 */
router.get("/requests", authenticate, async (req, res): Promise<void> => {
  try {
    const requests = await UserModel.getFriendRequests(req.user.id);

    if (!requests) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res
      .status(500)
      .json({ error: "Server failed to fetch friend requests" });
  }
});

/**
 * @route PUT /api/friends/requests/:userId/accept
 * @desc Accept a friend request
 * @access Private
 */
router.put(
  "/requests/:userId/accept",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const requesterId = req.params.userId;

      const result = await UserModel.acceptFriendRequest(
        req.user.id,
        requesterId
      );

      if (!result) {
        res.status(400).json({
          error:
            "Cannot accept request. User either doesn't exist or request was not found.",
        });
        return;
      }

      // Add requester to users with updates list
      usersWithNewItems.add(requesterId);

      res.json({ message: "Friend request accepted successfully" });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res
        .status(500)
        .json({ error: "Server failed to accept friend request" });
    }
  }
);

/**
 * @route PUT /api/friends/requests/:userId/decline
 * @desc Decline a friend request
 * @access Private
 */
router.put(
  "/requests/:userId/decline",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const requesterId = req.params.userId;

      const result = await UserModel.declineFriendRequest(
        req.user.id,
        requesterId
      );

      if (!result) {
        res.status(400).json({
          error:
            "Cannot decline request. User either doesn't exist or request was not found.",
        });
        return;
      }

      res.json({ message: "Friend request declined" });
    } catch (error) {
      console.error("Error declining friend request:", error);
      res
        .status(500)
        .json({ error: "Server failed to decline friend request" });
    }
  }
);

/**
 * @route DELETE /api/friends/:userId
 * @desc Remove a friend
 * @access Private
 */
router.delete("/:userId", authenticate, async (req, res): Promise<void> => {
  try {
    const friendId = req.params.userId;

    const result = await UserModel.removeFriend(req.user.id, friendId);

    if (!result) {
      res.status(400).json({
        error:
          "Cannot remove friend. User either doesn't exist or you're not friends.",
      });
      return;
    }

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Server failed to remove friend" });
  }
});

export default router;
