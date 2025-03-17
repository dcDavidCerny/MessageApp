import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";
import { AccessToken, Conversation, Message, User } from "./types";

// Define the database shape
interface DatabaseSchema {
  users: User[];
  messages: Message[];
  conversations: Conversation[];
  accessToken: AccessToken[];
}

// Set default data
const defaultData: DatabaseSchema = {
  users: [],
  messages: [],
  conversations: [],
  accessToken: [],
};

// Configure lowdb to use JSON file adapter
const file = join(process.cwd(), "data/db.json");
const adapter = new JSONFile<DatabaseSchema>(file);
const db = new Low<DatabaseSchema>(adapter, defaultData);

// Initialize the database
export const initDb = async (): Promise<void> => {
  // Create necessary directory structure if it doesn't exist
  try {
    await adapter.read();
    console.log("Database loaded successfully");
  } catch (error) {
    console.log("Database file not found" + error);
    console.log("Creating new database file");
    await db.write();
  }
};

// Write changes to the database
export const saveDb = async (): Promise<void> => {
  await db.write();
};

// Export the database instance
export { db };

// Helper function to generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
