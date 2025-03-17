import express from "express";
import { authenticate } from "../middleware/auth.js";
import { ConversationModel } from "../models/conversation.js";
import { MessageModel } from "../models/message.js";
import { usersWithNewItems } from "../server.js";

const router = express.Router();

/**
 * @route GET /api/conversations/:id/messages
 * @desc Get messages for a specific conversation
 * @access Private
 */
router.get(
  "/conversations/:id/messages",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const conversationId = req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const before = req.query.before
        ? new Date(req.query.before as string)
        : undefined;

      // Check if user has access to the conversation
      const isMember = await ConversationModel.isParticipant(
        conversationId,
        req.user.id
      );
      if (!isMember) {
        res.status(403).json({ error: "You don't have access to this conversation" });
        return;
      }

      const messages = await MessageModel.findByConversationId(
        conversationId,
        limit,
        before
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Server failed to fetch messages" });
    }
  }
);

/**
 * @route POST /api/conversations/:id/messages
 * @desc Send a new message to the conversation
 * @access Private
 */
router.post(
  "/conversations/:id/messages",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const conversationId = req.params.id;
      const { content, metadata } = req.body;

      if (!content) {
        res.status(400).json({ error: "Message content is required" });
        return;
      }

      // Check if user has access to the conversation
      const conversation = await ConversationModel.findById(conversationId);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      if (!conversation.participantIds.includes(req.user.id)) {
        res.status(403).json({ error: "You don't have access to this conversation" });
        return;
      }

      // Create message
      const newMessage = await MessageModel.create({
        conversationId: conversationId,
        senderId: req.user.id,
        content: content,
        metadata: metadata || {},
      });

      // Add all conversation participants to the list of users with new items
      // except the sender
      conversation.participantIds.forEach((userId) => {
        if (userId !== req.user.id) {
          usersWithNewItems.add(userId);
        }
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Server failed to send message" });
    }
  }
);

/**
 * @route PUT /api/messages/:id/read
 * @desc Mark message as read
 * @access Private
 */
router.put("/:id/read", authenticate, async (req, res): Promise<void> => {
  try {
    const messageId = req.params.id;

    // Get message
    const message = await MessageModel.findById(messageId);

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    // Check if user has access to this message
    const isMember = await ConversationModel.isParticipant(
      message.conversationId,
      req.user.id
    );
    if (!isMember) {
      res.status(403).json({ error: "You don't have access to this message" });
      return;
    }

    await MessageModel.markAsRead(messageId, req.user.id);
    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res
      .status(500)
      .json({ error: "Server failed to mark message as read" });
  }
});

/**
 * @route PUT /api/conversations/:id/read
 * @desc Mark all messages in conversation as read
 * @access Private
 */
router.put(
  "/conversations/:id/read",
  authenticate,
  async (req, res): Promise<void> => {
    try {
      const conversationId = req.params.id;

      // Check if user has access to the conversation
      const isMember = await ConversationModel.isParticipant(
        conversationId,
        req.user.id
      );
      if (!isMember) {
        res.status(403).json({ error: "You don't have access to this conversation" });
        return;
      }

      const markedCount = await MessageModel.markAllAsRead(
        conversationId,
        req.user.id
      );
      res.json({
        message: `${markedCount} messages marked as read`,
        markedCount,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res
        .status(500)
        .json({ error: "Server failed to mark messages as read" });
    }
  }
);

/**
 * @route DELETE /api/messages/:id
 * @desc Delete a message
 * @access Private
 */
router.delete("/:id", authenticate, async (req, res): Promise<void> => {
  try {
    const messageId = req.params.id;

    // Get message
    const message = await MessageModel.findById(messageId);

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    // Only the sender can delete the message
    if (message.senderId !== req.user.id) {
      res.status(403).json({ error: "You don't have permission to delete this message" });
      return;
    }

    await MessageModel.delete(messageId);
    res.json({ message: "Message successfully deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Server failed to delete message" });
  }
});

/**
 * @route GET /api/messages/unread
 * @desc Get unread message counts for all conversations
 * @access Private
 */
router.get("/unread", authenticate, async (req, res) => {
  try {
    const conversations = await ConversationModel.findByUserId(req.user.id);
    const result: { [key: string]: number } = {};

    // Get unread count for each conversation
    for (const conv of conversations) {
      const unreadCount = await MessageModel.getUnreadCount(
        conv.id,
        req.user.id
      );
      if (unreadCount > 0) {
        result[conv.id] = unreadCount;
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error getting unread message counts:", error);
    res
      .status(500)
      .json({ error: "Server failed to get unread message counts" });
  }
});

/**
 * @route GET /api/messages/search
 * @desc Search messages by content
 * @access Private
 */
router.get("/search", authenticate, async (req, res): Promise<void> => {
  try {
    const searchTerm = req.query.term as string;
    const conversationId = req.query.conversationId as string | undefined;

    if (!searchTerm || searchTerm.length < 2) {
      res
        .status(400)
        .json({ error: "Search term must be at least 2 characters" });
      return;
    }

    // If conversation is specified, check access
    if (conversationId) {
      const isMember = await ConversationModel.isParticipant(
        conversationId,
        req.user.id
      );
      if (!isMember) {
        res.status(403).json({ error: "You don't have access to this conversation" });
        return;
      }
    }

    // Search messages
    let messages = await MessageModel.searchMessages(searchTerm, conversationId);

    // If no conversation specified, filter results by conversations
    // the user has access to
    if (!conversationId) {
      const userConversations = await ConversationModel.findByUserId(
        req.user.id
      );
      const conversationIds = userConversations.map((c) => c.id);
      messages = messages.filter((message) =>
        conversationIds.includes(message.conversationId)
      );
    }

    res.json(messages);
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Server failed to search messages" });
  }
});

export default router;
