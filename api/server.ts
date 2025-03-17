import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { initDb } from "./db.js";
import authRouter from "./routes/auth.js";
import conversationRouter from "./routes/conversation.js";
import friendRouter from "./routes/friend.js";
import messageRouter from "./routes/message.js";
import updatesRouter from "./routes/updates.js";
import userRouter from "./routes/user.js";

// Set to track users who have new items (messages, friend requests)
export const usersWithNewItems: Set<string> = new Set();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Load database before starting server
await initDb().catch((error) => {
  console.error("Error initializing database:", error);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://messageapp.dcdavidcerny.com"
        : "http://localhost:5173",
    credentials: true, // Allow cookies with CORS
  })
);
app.use(express.json());
app.use(cookieParser());

// Logging middleware for development environment
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/friends", friendRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messageRouter);
app.use("/updates", updatesRouter);

app.get("/healthCheck", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.json({ message: "MessageApp API " });
});

// Handle non-existent paths
app.use((req, res) => {
  res.status(404).json({ error: "Requested path does not exist" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
