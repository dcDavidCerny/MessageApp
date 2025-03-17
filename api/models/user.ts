/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcrypt";
import { db, generateId, saveDb } from "../db.js";
import { User } from "../types.js";
import { AccessTokenModel } from "./accessToken.js";
import { ConversationModel } from "./conversation.js";
import { MessageModel } from "./message.js";

export class UserModel {
  /**
   * Create a new user (register)
   * @param userData User data without id, createdAt, updatedAt
   * @returns The created user object (without password) and access token
   * @throws Error if email already exists
   */
  static async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<{user: Omit<User, "password">, token: string}> {
    // Check if email is already in use
    if (await this.findByEmail(userData.email)) {
      throw new Error("Email already exists");
    }

    const now = new Date();
    const hashedPassword = await this.hashPassword(userData.password);

    const newUser: User = {
      id: generateId(),
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    db.data.users.push(newUser);
    await saveDb();

    // Generate access token for the new user
    const accessToken = await AccessTokenModel.generateToken(newUser.id);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: accessToken.token
    };
  }

  /**
   * Find a user by their ID
   * @param id User ID
   * @returns User object without password or null if not found
   */
  static async findById(id: string): Promise<Omit<User, "password"> | null> {
    const user = db.data.users.find(user => user.id === id);
    
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find a user by their email
   * @param email User email
   * @returns User object or null if not found
   */
  static async findByEmail(email: string): Promise<User | null> {
    return db.data.users.find(user => user.email === email) || null;
  }

  /**
   * Get all users
   * @returns Array of user objects without passwords
   */
  static async findAll(): Promise<Omit<User, "password">[]> {
    return db.data.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Update a user by ID
   * @param id User ID
   * @param userData Partial user data to update
   * @returns Updated user without password or null if not found
   */
  static async update(
    id: string, 
    userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "password">>
  ): Promise<Omit<User, "password"> | null> {
    const userIndex = db.data.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    const user = db.data.users[userIndex];
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    db.data.users[userIndex] = updatedUser;
    await saveDb();
    
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Update a user's password
   * @param id User ID
   * @param newPassword New password to set
   * @returns true if successful, false if user not found
   */
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const userIndex = db.data.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return false;
    
    const hashedPassword = await this.hashPassword(newPassword);
    db.data.users[userIndex].password = hashedPassword;
    db.data.users[userIndex].updatedAt = new Date();
    
    await saveDb();
    return true;
  }

  /**
   * Delete a user by ID
   * @param id User ID
   * @returns true if user was deleted, false if user was not found
   */
  static async delete(id: string): Promise<boolean> {
    const initialLength = db.data.users.length;
    db.data.users = db.data.users.filter(user => user.id !== id);
    
    if (initialLength === db.data.users.length) {
      return false;
    }
    
    await saveDb();
    return true;
  }

  /**
   * Authenticate a user (login)
   * @param email User email
   * @param password User password
   * @returns User object without password and access token if authentication successful, null otherwise
   */
  static async authenticate(email: string, password: string): Promise<{user: Omit<User, "password">, token: string} | null> {
    const user = await this.findByEmail(email);
    
    if (!user) return null;
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) return null;
    
    // Update last active and status
    const userIndex = db.data.users.findIndex(u => u.id === user.id);
    db.data.users[userIndex].lastActive = new Date();
    await saveDb();
    
    // Generate access token
    const accessToken = await AccessTokenModel.generateToken(user.id);
    
    const { password: _, ...userWithoutPassword } = user;
    return { 
      user: userWithoutPassword,
      token: accessToken.token
    };
  }

  /**
   * Verify if a token is valid and get the associated user
   * @param token Access token to verify
   * @returns User object without password if token is valid, null otherwise
   */
  static async getUserByToken(token: string): Promise<Omit<User, "password"> | null> {
    const userId = await AccessTokenModel.verifyToken(token);
    
    if (!userId) return null;
    
    return await this.findById(userId);
  }

  /**
   * Logout a user by invalidating their access token
   * @param token Access token to invalidate
   * @returns true if token was invalidated, false otherwise
   */
  static async logout(token: string): Promise<boolean> {
    return await AccessTokenModel.deleteToken(token);
  }

  /**
   * Logout a user from all devices by invalidating all their tokens
   * @param userId User ID
   * @returns Number of tokens invalidated
   */
  static async logoutAllSessions(userId: string): Promise<number> {
    return await AccessTokenModel.deleteAllForUser(userId);
  }

  /**
   * Find users by partial username or display name
   * @param searchTerm The search term to match against usernames
   * @returns Array of matching users without passwords
   */
  static async searchUsers(searchTerm: string): Promise<Omit<User, "password">[]> {
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    
    const matchedUsers = db.data.users.filter(user => 
      user.displayName.toLowerCase().includes(lowercaseSearchTerm)
    );
    
    return matchedUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Send a friend request from one user to another
   * @param requesterId ID of the user sending the request
   * @param recipientId ID of the user receiving the request
   * @returns true if successful, false if users not found or request already sent
   */
  static async sendFriendRequest(requesterId: string, recipientId: string): Promise<boolean> {
    // Don't allow sending requests to yourself
    if (requesterId === recipientId) {
      return false;
    }

    const requesterIndex = db.data.users.findIndex(user => user.id === requesterId);
    const recipientIndex = db.data.users.findIndex(user => user.id === recipientId);

    if (requesterIndex === -1 || recipientIndex === -1) {
      return false;
    }

    // Check if they're already friends
    if (db.data.users[recipientIndex].friendIds.includes(requesterId)) {
      return false;
    }

    // Check if request already exists
    if (db.data.users[recipientIndex].friendRequestUserIds.includes(requesterId)) {
      return false;
    }

    // Add requester to recipient's friend request list
    db.data.users[recipientIndex].friendRequestUserIds.push(requesterId);

    await saveDb();
    return true;
  }

  /**
   * Accept a friend request
   * @param userId ID of the user accepting the request
   * @param requesterId ID of the user who sent the request
   * @returns true if successful, false if users not found or no request exists
   */
  static async acceptFriendRequest(userId: string, requesterId: string): Promise<boolean> {
    const userIndex = db.data.users.findIndex(user => user.id === userId);
    const requesterIndex = db.data.users.findIndex(user => user.id === requesterId);

    if (userIndex === -1 || requesterIndex === -1) {
      return false;
    }

    // Check if request exists
    const requestIndex = db.data.users[userIndex].friendRequestUserIds.indexOf(requesterId);
    if (requestIndex === -1) {
      return false;
    }

    // Remove from friend requests
    db.data.users[userIndex].friendRequestUserIds.splice(requestIndex, 1);

    // Add each user to the other's friend list
    if (!db.data.users[userIndex].friendIds.includes(requesterId)) {
      db.data.users[userIndex].friendIds.push(requesterId);
    }
    
    if (!db.data.users[requesterIndex].friendIds.includes(userId)) {
      db.data.users[requesterIndex].friendIds.push(userId);
    }

    // Update timestamps
    const now = new Date();
    db.data.users[userIndex].updatedAt = now;
    db.data.users[requesterIndex].updatedAt = now;

    await saveDb();
    
    // Create a conversation between the new friends
    const conversation = await ConversationModel.createDirectConversation([requesterId, userId]);
    
    // Create a message from the requester
    await MessageModel.create({
      senderId: requesterId,
      conversationId: conversation.id,
      content: "Will you be my friend?",
      metadata: {}
    });
    
    // Create a response message from the accepter
    await MessageModel.create({
      senderId: userId,
      conversationId: conversation.id,
      content: "Of course I will <3",
      metadata: {}
    });
    
    return true;
  }

  /**
   * Decline a friend request
   * @param userId ID of the user declining the request
   * @param requesterId ID of the user who sent the request
   * @returns true if successful, false if users not found or no request exists
   */
  static async declineFriendRequest(userId: string, requesterId: string): Promise<boolean> {
    const userIndex = db.data.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return false;
    }

    // Check if request exists
    const requestIndex = db.data.users[userIndex].friendRequestUserIds.indexOf(requesterId);
    if (requestIndex === -1) {
      return false;
    }

    // Remove from friend requests
    db.data.users[userIndex].friendRequestUserIds.splice(requestIndex, 1);
    db.data.users[userIndex].updatedAt = new Date();

    await saveDb();
    return true;
  }

  /**
   * Remove a friend
   * @param userId ID of the user removing a friend
   * @param friendId ID of the friend to remove
   * @returns true if successful, false if users not found or not friends
   */
  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    const userIndex = db.data.users.findIndex(user => user.id === userId);
    const friendIndex = db.data.users.findIndex(user => user.id === friendId);

    if (userIndex === -1 || friendIndex === -1) {
      return false;
    }

    // Check if they are friends
    const friendIndexInUser = db.data.users[userIndex].friendIds.indexOf(friendId);
    const userIndexInFriend = db.data.users[friendIndex].friendIds.indexOf(userId);
    
    if (friendIndexInUser === -1) {
      return false;
    }

    // Remove from each other's friend lists
    db.data.users[userIndex].friendIds.splice(friendIndexInUser, 1);
    
    if (userIndexInFriend !== -1) {
      db.data.users[friendIndex].friendIds.splice(userIndexInFriend, 1);
    }

    // Update timestamps
    const now = new Date();
    db.data.users[userIndex].updatedAt = now;
    db.data.users[friendIndex].updatedAt = now;

    await saveDb();
    return true;
  }

  /**
   * Get a user's friends
   * @param userId User ID
   * @returns Array of friend user objects without passwords, or null if user not found
   */
  static async getFriends(userId: string): Promise<Omit<User, "password">[] | null> {
    const user = db.data.users.find(user => user.id === userId);
    
    if (!user) {
      return null;
    }

    const friends = db.data.users
      .filter(u => user.friendIds.includes(u.id))
      .map(friend => {
        const { password, ...friendWithoutPassword } = friend;
        return friendWithoutPassword;
      });

    return friends;
  }

  /**
   * Get users who have sent friend requests to a user
   * @param userId User ID
   * @returns Array of requester user objects without passwords, or null if user not found
   */
  static async getFriendRequests(userId: string): Promise<Omit<User, "password">[] | null> {
    const user = db.data.users.find(user => user.id === userId);
    
    if (!user) {
      return null;
    }

    const requesters = db.data.users
      .filter(u => user.friendRequestUserIds.includes(u.id))
      .map(requester => {
        const { password, ...requesterWithoutPassword } = requester;
        return requesterWithoutPassword;
      });

    return requesters;
  }

  /**
   * Hash a password
   * @param password Plain text password
   * @returns Hashed password
   */
  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}