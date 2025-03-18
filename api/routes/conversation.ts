import express from "express";
import { authenticate } from "../middleware/auth.js";
import { ConversationModel } from "../models/conversation.js";
import { UserModel } from "../models/user.js";

const router = express.Router();

/**
 * @route GET /api/conversations
 * @desc Get all user's conversations
 * @access Private
 */
router.get("/", authenticate, async (req, res): Promise<void> => {
  try {
    const conversations = await ConversationModel.getRecentConversations(
      req.user.id
    );
    // add participants info to each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipants = await UserModel.findByIds(
          conversation.participantIds.filter((id) => id !== req.user.id)
        );
        return { ...conversation, otherParticipants };
      })
    );
    res.json(conversationsWithParticipants);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server failed to fetch conversations" });
  }
});

/**
 * @route POST /api/conversations/direct/:userId
 * @desc Create direct conversation with another user
 * @access Private
 */
router.post(
  "/direct/:userId",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const otherUserId = req.params.userId;

      // Check that user is not creating conversation with themselves
      if (otherUserId === req.user.id) {
        res
          .status(400)
          .json({ error: "You cannot create a conversation with yourself" });
        return;
      }

      const conversation = await ConversationModel.createDirectConversation([
        req.user.id,
        otherUserId,
      ]);

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating direct conversation:", error);
      res
        .status(500)
        .json({ error: "Server failed to create direct conversation" });
    }
  }
);

/**
 * @route POST /api/conversations/group
 * @desc Create a group conversation
 * @access Private
 */
router.post("/group", authenticate, async (req, res): Promise<void> => {
  try {
    const { name, userIds } = req.body;

    if (!name) {
      res.status(400).json({ error: "Conversation name is required" });
      return;
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
      res.status(400).json({ error: "You must add at least 2 users" });
      return;
    }

    // Add current user ID to the participants list
    const allParticipants = Array.from(new Set([...userIds, req.user.id]));

    const conversation = await ConversationModel.createGroupConversation(
      allParticipants,
      name
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating group conversation:", error);
    res
      .status(500)
      .json({ error: "Server failed to create group conversation" });
  }
});

/**
 * @route GET /api/conversations/:id
 * @desc Get conversation by ID
 * @access Private
 */
router.get("/:id", authenticate, async (req, res): Promise<void> => {
  try {
    const conversationId = req.params.id;
    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Check if user is part of the conversation
    if (!conversation.participantIds.includes(req.user.id)) {
      res
        .status(403)
        .json({ error: "You don't have access to this conversation" });
      return;
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server failed to fetch conversation" });
  }
});

/**
 * @route PUT /api/conversations/:id
 * @desc Update conversation (name only)
 * @access Private
 */
router.put("/:id", authenticate, async (req, res): Promise<void> => {
  try {
    const conversationId = req.params.id;
    const { name } = req.body;

    // Check if conversation exists
    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Check if user is part of the conversation
    if (!conversation.participantIds.includes(req.user.id)) {
      res
        .status(403)
        .json({ error: "You don't have access to this conversation" });
      return;
    }

    // Updates are only allowed for group conversations
    if (!conversation.isGroup) {
      res
        .status(400)
        .json({ error: "Direct conversations cannot be modified" });
      return;
    }

    const updatedConversation = await ConversationModel.update(conversationId, {
      name: name,
    });

    res.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Server failed to update conversation" });
  }
});

/**
 * @route DELETE /api/conversations/:id
 * @desc Delete conversation
 * @access Private
 */
router.delete("/:id", authenticate, async (req, res): Promise<void> => {
  try {
    const conversationId = req.params.id;

    // Check if conversation exists
    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Check if user is part of the conversation
    if (!conversation.participantIds.includes(req.user.id)) {
      res
        .status(403)
        .json({ error: "You don't have access to this conversation" });
      return;
    }

    await ConversationModel.delete(conversationId);

    res.json({ message: "Conversation successfully deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Server failed to delete conversation" });
  }
});

/**
 * @route POST /api/conversations/:id/participants
 * @desc Add users to a group conversation
 * @access Private
 */
router.post(
  "/:id/participants",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const conversationId = req.params.id;
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        res
          .status(400)
          .json({ error: "You must provide a list of users to add" });
        return;
      }

      // Check if conversation exists
      const conversation = await ConversationModel.findById(conversationId);

      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      // Check if user is part of the conversation
      if (!conversation.participantIds.includes(req.user.id)) {
        res
          .status(403)
          .json({ error: "You don't have access to this conversation" });
        return;
      }

      // Adding is only allowed for group conversations
      if (!conversation.isGroup) {
        res
          .status(400)
          .json({ error: "You cannot add users to a direct conversation" });
        return;
      }

      const updatedConversation = await ConversationModel.addParticipants(
        conversationId,
        userIds
      );

      res.json(updatedConversation);
    } catch (error) {
      console.error("Error adding users to conversation:", error);
      res
        .status(500)
        .json({ error: "Server failed to add users to conversation" });
    }
  }
);

/**
 * @route DELETE /api/conversations/:id/participants/:userId
 * @desc Remove a user from a group conversation
 * @access Private
 */
router.delete(
  "/:id/participants/:userId",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const conversationId = req.params.id;
      const userToRemoveId = req.params.userId;

      // Check if conversation exists
      const conversation = await ConversationModel.findById(conversationId);

      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      // Check if user is part of the conversation
      if (!conversation.participantIds.includes(req.user.id)) {
        res
          .status(403)
          .json({ error: "You don't have access to this conversation" });
        return;
      }

      // Removing is only allowed for group conversations
      if (!conversation.isGroup) {
        res.status(400).json({
          error: "You cannot remove users from a direct conversation",
        });
        return;
      }

      // User can remove themselves or others from the conversation
      const updatedConversation = await ConversationModel.removeParticipant(
        conversationId,
        userToRemoveId
      );

      res.json(updatedConversation);
    } catch (error) {
      console.error("Error removing user from conversation:", error);
      res.status(500).json({
        error: "Server failed to remove user from conversation",
      });
    }
  }
);

export default router;
