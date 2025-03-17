import * as crypto from "crypto";
import { db, saveDb } from "../db.js";
import { AccessToken } from "../types.js";

export class AccessTokenModel {
  /**
   * Generate a new access token for a user
   * @param userId The user ID to generate a token for
   * @param expiresInDays Number of days until token expires (default: 7)
   * @returns The created access token
   */
  static async generateToken(
    userId: string,
    expiresInDays = 7
  ): Promise<AccessToken> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration date
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + expiresInDays);

    const accessToken: AccessToken = {
      userId,
      token,
      createdAt: now,
      expiresAt,
    };

    db.data.accessToken.push(accessToken);
    await saveDb();

    return accessToken;
  }

  /**
   * Verify if a token is valid and not expired
   * @param token The token to verify
   * @returns The userId associated with the token, or null if invalid/expired
   */
  static async verifyToken(token: string): Promise<string | null> {
    const accessToken = db.data.accessToken.find((t) => t.token === token);

    if (!accessToken) return null;

    // Check if token is expired
    if (new Date() > new Date(accessToken.expiresAt)) {
      // Token expired, remove it
      await this.deleteToken(token);
      return null;
    }

    return accessToken.userId;
  }

  /**
   * Delete a specific token
   * @param token The token to delete
   * @returns true if token was deleted, false if not found
   */
  static async deleteToken(token: string): Promise<boolean> {
    const initialLength = db.data.accessToken.length;
    db.data.accessToken = db.data.accessToken.filter((t) => t.token !== token);

    if (initialLength === db.data.accessToken.length) {
      return false;
    }

    await saveDb();
    return true;
  }

  /**
   * Delete all tokens for a specific user
   * @param userId The user ID whose tokens should be deleted
   * @returns Number of tokens that were deleted
   */
  static async deleteAllForUser(userId: string): Promise<number> {
    const initialLength = db.data.accessToken.length;
    db.data.accessToken = db.data.accessToken.filter(
      (t) => t.userId !== userId
    );

    const deletedCount = initialLength - db.data.accessToken.length;

    if (deletedCount > 0) {
      await saveDb();
    }

    return deletedCount;
  }

  /**
   * Clean up expired tokens
   * @returns Number of expired tokens that were removed
   */
  static async removeExpiredTokens(): Promise<number> {
    const now = new Date();
    const initialLength = db.data.accessToken.length;

    db.data.accessToken = db.data.accessToken.filter(
      (token) => new Date(token.expiresAt) > now
    );

    const deletedCount = initialLength - db.data.accessToken.length;

    if (deletedCount > 0) {
      await saveDb();
    }

    return deletedCount;
  }
}
