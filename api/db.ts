import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";
import { AccessToken, Conversation, Message, User } from "./types.js";

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

// Configure lowdb to use JSON file
const filePath = join(process.cwd(), "api/db.json");
const file = new JSONFile<DatabaseSchema>(filePath);
const db = new Low<DatabaseSchema>(file, defaultData);
await db.read();
if (db.data == null) {
  db.data = defaultData;
  await db.write();
  console.log("Database initialized with default data");
} else {
  console.log("Database loaded with existing data");
}

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
