import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import multer, { Multer } from "multer"; // Import multer and types for multer
import fs from "fs"; // Import fs to check/create the uploads directory
import path from "path"; // Import path for cross-platform path resolution
import authRouter from "./routes/auth.js";
import conversationRouter from "./routes/conversation.js";
import friendRouter from "./routes/friend.js";
import messageRouter from "./routes/message.js";
import updatesRouter from "./routes/updates.js";
import userRouter from "./routes/user.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Set to track users who have new items (messages, friend requests)
export const usersWithNewItems: Set<string> = new Set();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure 'uploads' directory exists
const __filename = fileURLToPath(import.meta.url); // Get the file path of the current module
const __dirname = dirname(__filename); // Get the directory path of the current module

const uploadDir = path.join(__dirname, "uploads"); // Path to uploads folder
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created 'uploads' directory.");
}

// Configure storage for multer (you can adjust this as needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the dynamically created 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Save the file with a unique timestamp
  },
});

// Initialize multer with the defined storage configuration
const upload: Multer = multer({ storage });

// Middleware

app.use(
  cors({
    origin: function (origin, callback) {
      // Add both localhost and external IP address
      const allowedOrigins = [
        "http://localhost:5173",
        "http://213.180.47.252:5173",  // Your external IP address
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);  // Allow if origin is in the allowed list
      } else {
        callback(new Error("Not allowed by CORS"));  // Block if origin is not allowed
      }
    },
    credentials: true,  // Allow cookies with CORS
  })
);








// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? "https://messageapp.dcdavidcerny.com"
//         : "http://localhost:5173",
//     credentials: true, // Allow cookies with CORS
//   })
// );
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

// File upload route (POST /upload)
app.post("/upload", upload.single("file"), (req: Request, res: Response): void => {
  if (!req.file) {
    console.error("No file uploaded.");
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log("File uploaded successfully:", fileUrl);
    res.json({ fileUrl });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "MessageApp API" });
});

// Handle non-existent paths
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Requested path does not exist" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;