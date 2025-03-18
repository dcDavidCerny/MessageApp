// types for API routes

// Core Data Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  friendIds: string[];
  friendRequestUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  isGroup: boolean;
  name?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
  readBy: string[];
  createdAt: string;
}

// Auth Routes Types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface VerifyResponse {
  valid: boolean;
  user?: User;
}

// User Routes Types
export interface UpdateUserRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// Conversation Routes Types
export interface CreateGroupConversationRequest {
  name: string;
  userIds: string[];
}

export interface UpdateConversationRequest {
  name: string;
}

export interface AddParticipantsRequest {
  userIds: string[];
}

// Message Routes Types
export interface GetMessagesParams {
  limit?: number;
  before?: string;
}

export interface SendMessageRequest {
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface MarkAsReadResponse {
  message: string;
  markedCount?: number;
}

export interface UnreadCountResponse {
  [conversationId: string]: number;
}

export interface SearchMessagesParams {
  term: string;
  conversationId?: string;
}

// Updates Route Types
export interface UpdatesCheckResponse {
  hasNewItems: boolean;
}

// Error Response Type
export interface ErrorResponse {
  error: string;
}
