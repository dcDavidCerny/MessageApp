import { db, generateId, saveDb } from "../db";
import { Message } from "../types";

export class MessageModel {
  /**
   * Create a new message
   * @param messageData Message data without id, createdAt, updatedAt
   * @returns The created message object
   */
  static async create(messageData: Omit<Message, "id" | "createdAt" | "updatedAt" | "read">): Promise<Message> {
    const now = new Date();
    
    const newMessage: Message = {
      id: generateId(),
      ...messageData,
      createdAt: now,
      updatedAt: now,
      read: [],
      metadata: messageData.metadata || {}
    };
    
    db.data.messages.push(newMessage);
    
    // Update the lastMessageAt of the conversation
    const conversationIndex = db.data.conversations.findIndex(
      conv => conv.id === newMessage.conversationId
    );
    
    if (conversationIndex !== -1) {
      db.data.conversations[conversationIndex].lastMessageAt = now;
    }
    
    await saveDb();
    return newMessage;
  }
  
  /**
   * Find a message by ID
   * @param id Message ID
   * @returns Message object or null if not found
   */
  static async findById(id: string): Promise<Message | null> {
    return db.data.messages.find(message => message.id === id) || null;
  }
  
  /**
   * Get messages for a conversation
   * @param conversationId Conversation ID
   * @param limit Maximum number of messages to return (default: 50)
   * @param before Get messages before this date (for pagination)
   * @returns Array of messages
   */
  static async findByConversationId(
    conversationId: string,
    limit = 50,
    before?: Date
  ): Promise<Message[]> {
    let messages = db.data.messages.filter(
      message => message.conversationId === conversationId
    );
    
    if (before) {
      messages = messages.filter(
        message => message.createdAt < before
      );
    }
    
    // Sort by createdAt in descending order (newest first)
    messages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Limit the number of messages
    return messages.slice(0, limit);
  }
  
  /**
   * Update a message by ID
   * @param id Message ID
   * @param messageData Partial message data to update
   * @returns Updated message or null if not found
   */
  static async update(
    id: string,
    messageData: Partial<Omit<Message, "id" | "senderId" | "conversationId" | "createdAt" | "updatedAt">>
  ): Promise<Message | null> {
    const messageIndex = db.data.messages.findIndex(message => message.id === id);
    
    if (messageIndex === -1) return null;
    
    const message = db.data.messages[messageIndex];
    const updatedMessage = {
      ...message,
      ...messageData,
      updatedAt: new Date()
    };
    
    db.data.messages[messageIndex] = updatedMessage;
    await saveDb();
    
    return updatedMessage;
  }
  
  /**
   * Delete a message by ID
   * @param id Message ID
   * @returns true if message was deleted, false if message was not found
   */
  static async delete(id: string): Promise<boolean> {
    const initialLength = db.data.messages.length;
    db.data.messages = db.data.messages.filter(message => message.id !== id);
    
    if (initialLength === db.data.messages.length) {
      return false;
    }
    
    await saveDb();
    return true;
  }
  
  /**
   * Mark a message as read by a user
   * @param messageId Message ID
   * @param userId User ID who read the message
   * @returns Updated message or null if message not found
   */
  static async markAsRead(messageId: string, userId: string): Promise<Message | null> {
    const messageIndex = db.data.messages.findIndex(message => message.id === messageId);
    
    if (messageIndex === -1) return null;
    
    // Check if the user already marked this message as read
    const alreadyRead = db.data.messages[messageIndex].read.some(
      readReceipt => readReceipt.userId === userId
    );
    
    if (!alreadyRead) {
      db.data.messages[messageIndex].read.push({
        userId,
        at: new Date()
      });
      
      await saveDb();
    }
    
    return db.data.messages[messageIndex];
  }
  
  /**
   * Mark all messages in a conversation as read by a user
   * @param conversationId Conversation ID
   * @param userId User ID who read the messages
   * @returns Number of newly marked messages
   */
  static async markAllAsRead(conversationId: string, userId: string): Promise<number> {
    const messages = db.data.messages.filter(
      message => message.conversationId === conversationId && 
                !message.read.some(readReceipt => readReceipt.userId === userId)
    );
    
    const now = new Date();
    let markedCount = 0;
    
    for (const message of messages) {
      const messageIndex = db.data.messages.findIndex(m => m.id === message.id);
      
      if (messageIndex !== -1) {
        db.data.messages[messageIndex].read.push({
          userId,
          at: now
        });
        markedCount++;
      }
    }
    
    if (markedCount > 0) {
      await saveDb();
    }
    
    return markedCount;
  }
  
  /**
   * Get unread messages count for a user in a conversation
   * @param conversationId Conversation ID
   * @param userId User ID
   * @returns Number of unread messages
   */
  static async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return db.data.messages.filter(
      message => 
        message.conversationId === conversationId && 
        !message.read.some(readReceipt => readReceipt.userId === userId)
    ).length;
  }
  
  /**
   * Get message history for multiple conversations (e.g. for a user's inbox)
   * @param conversationIds Array of conversation IDs
   * @param limit Maximum number of messages per conversation (default: 1)
   * @returns Map of conversation IDs to their latest messages
   */
  static async getLatestByConversations(
    conversationIds: string[],
    limit = 1
  ): Promise<Map<string, Message[]>> {
    const result = new Map<string, Message[]>();
    
    for (const conversationId of conversationIds) {
      const messages = await this.findByConversationId(conversationId, limit);
      result.set(conversationId, messages);
    }
    
    return result;
  }
  
  /**
   * Search for messages containing specific text
   * @param searchTerm Text to search for in message content
   * @param conversationId Optional conversation ID to limit search scope
   * @returns Array of matching messages
   */
  static async searchMessages(searchTerm: string, conversationId?: string): Promise<Message[]> {
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    
    let messages = db.data.messages.filter(message => 
      message.content.toLowerCase().includes(lowercaseSearchTerm)
    );
    
    if (conversationId) {
      messages = messages.filter(message => message.conversationId === conversationId);
    }
    
    // Sort by most recent first
    messages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return messages;
  }
}
