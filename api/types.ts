/**
 * User interface - represents a user in the messaging application
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // This would be hashed in the database
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
  friendIds: string[];
  friendRequestUserIds: string[]; // Users who have sent friend requests
}

/**
 * Message interface - represents a single message in a conversation
 */
export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
  read: {
    userId: string;
    at: Date;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any; // Additional metadata for messages
}

/**
 * MessageAttachment interface - represents file attachments to messages
 */
export interface MessageAttachment {
  id: string;
  messageId: string;
  type: "image" | "video" | "audio" | "other";
  url: string;
  name: string;
  size: number; // in bytes
}

/**
 * Conversation interface - represents a conversation between users
 */
export interface Conversation {
  id: string;
  name?: string; // Optional name for group conversations
  participantIds: string[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  isGroup: boolean;
}

export interface AccessToken {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}
