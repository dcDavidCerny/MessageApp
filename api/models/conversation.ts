import { db, generateId, saveDb } from "../db";
import { Conversation } from "../types";

export class ConversationModel {
  /**
   * Create a new conversation
   * @param conversationData Conversation data without id, createdAt, updatedAt
   * @returns The created conversation object
   */
  static async create(
    conversationData: Omit<Conversation, "id" | "createdAt" | "updatedAt">
  ): Promise<Conversation> {
    const now = new Date();

    const newConversation: Conversation = {
      id: generateId(),
      ...conversationData,
      createdAt: now,
      updatedAt: now,
    };

    db.data.conversations.push(newConversation);
    await saveDb();

    return newConversation;
  }

  /**
   * Create a direct (1-on-1) conversation between two users
   * @param userIds Array of exactly two user IDs
   * @returns The created conversation object or existing conversation if one already exists
   * @throws Error if not exactly two user IDs are provided
   */
  static async createDirectConversation(
    userIds: [string, string]
  ): Promise<Conversation> {
    if (userIds.length !== 2) {
      throw new Error("Direct conversations require exactly two users");
    }

    // Check if a direct conversation already exists between these users
    const existingConversation = await this.findDirectConversation(
      userIds[0],
      userIds[1]
    );

    if (existingConversation) {
      return existingConversation;
    }

    return this.create({
      participantIds: userIds,
      isGroup: false,
    });
  }

  /**
   * Create a group conversation
   * @param userIds Array of user IDs (minimum 2)
   * @param name Group conversation name
   * @returns The created conversation object
   * @throws Error if fewer than 2 user IDs are provided
   */
  static async createGroupConversation(
    userIds: string[],
    name: string
  ): Promise<Conversation> {
    if (userIds.length < 2) {
      throw new Error("Group conversations require at least two users");
    }

    return this.create({
      participantIds: userIds,
      name,
      isGroup: true,
    });
  }

  /**
   * Find a conversation by ID
   * @param id Conversation ID
   * @returns Conversation object or null if not found
   */
  static async findById(id: string): Promise<Conversation | null> {
    return (
      db.data.conversations.find((conversation) => conversation.id === id) ||
      null
    );
  }

  /**
   * Get all conversations for a user
   * @param userId User ID
   * @returns Array of conversations where the user is a participant
   */
  static async findByUserId(userId: string): Promise<Conversation[]> {
    return db.data.conversations.filter((conversation) =>
      conversation.participantIds.includes(userId)
    );
  }

  /**
   * Find a direct conversation between two specific users
   * @param userId1 First user ID
   * @param userId2 Second user ID
   * @returns Direct conversation or null if none exists
   */
  static async findDirectConversation(
    userId1: string,
    userId2: string
  ): Promise<Conversation | null> {
    return (
      db.data.conversations.find(
        (conversation) =>
          !conversation.isGroup &&
          conversation.participantIds.includes(userId1) &&
          conversation.participantIds.includes(userId2) &&
          conversation.participantIds.length === 2
      ) || null
    );
  }

  /**
   * Update a conversation by ID
   * @param id Conversation ID
   * @param conversationData Partial conversation data to update
   * @returns Updated conversation or null if not found
   */
  static async update(
    id: string,
    conversationData: Partial<
      Omit<
        Conversation,
        "id" | "createdAt" | "updatedAt" | "participantIds" | "isGroup"
      >
    >
  ): Promise<Conversation | null> {
    const conversationIndex = db.data.conversations.findIndex(
      (conversation) => conversation.id === id
    );

    if (conversationIndex === -1) return null;

    const conversation = db.data.conversations[conversationIndex];
    const updatedConversation = {
      ...conversation,
      ...conversationData,
      updatedAt: new Date(),
    };

    db.data.conversations[conversationIndex] = updatedConversation;
    await saveDb();

    return updatedConversation;
  }

  /**
   * Add multiple users to a conversation
   * @param conversationId Conversation ID
   * @param userIds Array of user IDs to add
   * @returns Updated conversation or null if not found
   * @throws Error if trying to add participants to a direct conversation
   */
  static async addParticipants(
    conversationId: string,
    userIds: string[]
  ): Promise<Conversation | null> {
    const conversationIndex = db.data.conversations.findIndex(
      (conversation) => conversation.id === conversationId
    );

    if (conversationIndex === -1) return null;

    const conversation = db.data.conversations[conversationIndex];

    // Cannot add participants to a direct conversation
    if (!conversation.isGroup) {
      throw new Error("Cannot add participants to a direct conversation");
    }

    // Add only users who are not already participants
    const uniqueNewUserIds = userIds.filter(
      (id) => !conversation.participantIds.includes(id)
    );

    if (uniqueNewUserIds.length > 0) {
      conversation.participantIds.push(...uniqueNewUserIds);
      conversation.updatedAt = new Date();
      await saveDb();
    }

    return conversation;
  }

  /**
   * Remove a user from a conversation
   * @param conversationId Conversation ID
   * @param userId User ID to remove
   * @returns Updated conversation or null if not found
   * @throws Error if trying to remove a participant from a direct conversation
   */
  static async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null> {
    const conversationIndex = db.data.conversations.findIndex(
      (conversation) => conversation.id === conversationId
    );

    if (conversationIndex === -1) return null;

    const conversation = db.data.conversations[conversationIndex];

    // Cannot remove participants from a direct conversation
    if (!conversation.isGroup) {
      throw new Error("Cannot remove participants from a direct conversation");
    }

    // Check if user is a participant
    if (!conversation.participantIds.includes(userId)) {
      return conversation;
    }

    conversation.participantIds = conversation.participantIds.filter(
      (id) => id !== userId
    );
    conversation.updatedAt = new Date();

    await saveDb();
    return conversation;
  }

  /**
   * Delete a conversation by ID
   * @param id Conversation ID
   * @returns true if conversation was deleted, false if conversation was not found
   */
  static async delete(id: string): Promise<boolean> {
    const initialLength = db.data.conversations.length;
    db.data.conversations = db.data.conversations.filter(
      (conversation) => conversation.id !== id
    );

    if (initialLength === db.data.conversations.length) {
      return false;
    }

    // Also delete all messages from this conversation
    db.data.messages = db.data.messages.filter(
      (message) => message.conversationId !== id
    );

    await saveDb();
    return true;
  }

  /**
   * Check if a user is a participant in a conversation
   * @param conversationId Conversation ID
   * @param userId User ID
   * @returns true if user is a participant, false otherwise
   */
  static async isParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const conversation = await this.findById(conversationId);
    return !!conversation && conversation.participantIds.includes(userId);
  }

  /**
   * Get recent conversations for a user, sorted by last message time
   * @param userId User ID
   * @param limit Maximum number of conversations to return (default: 20)
   * @returns Array of conversations sorted by most recent activity
   */
  static async getRecentConversations(
    userId: string,
    limit = 20
  ): Promise<Conversation[]> {
    const userConversations = await this.findByUserId(userId);

    // Sort by lastMessageAt or updatedAt in descending order
    userConversations.sort((a, b) => {
      const timeA = a.lastMessageAt || a.updatedAt;
      const timeB = b.lastMessageAt || b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return userConversations.slice(0, limit);
  }
}
