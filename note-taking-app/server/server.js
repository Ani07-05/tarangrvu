// note-taking-app/server/server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import Groq from "groq-sdk";
import authRoutes from "./routes/auth.js";
import notesRouter from "./routes/notes.js";
import summaryRouter from "./routes/summary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const JWT_SECRET = "secretkey"; // Change for production

// Initialize the Groq client with your API key
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});
// Configure multer for handling audio file uploads
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Database setup
export const setupDatabase = async () => {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      keywords TEXT,
      language TEXT DEFAULT 'English',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  return db;
};

// Authentication middleware
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

let db;
setupDatabase().then((database) => {
  db = database;
  console.log("Database initialized");
}).catch(error => {
  console.error("Database initialization error:", error);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach database to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Public routes (no auth required)
app.use("/api/auth", authRoutes);

// Transcription endpoint (public)
// Transcription endpoint (public)
app.post("/api/notes/transcribe", upload.single("audio"), async (req, res) => {
  let inputPath = req.file?.path;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Rename the file to have .webm extension
    const newPath = `${inputPath}.webm`;
    fs.renameSync(inputPath, newPath);
    inputPath = newPath;

    console.log("🔹 Processing audio file:", inputPath);

    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(inputPath),
        model: "whisper-large-v3-turbo",
        response_format: "json",
        language: "en",
        temperature: 0.0,
      });

      // Remove temporary file
      fs.unlink(inputPath, (err) => {
        if (err) console.error("Error removing temp file:", err);
      });

      if (!transcription || !transcription.text) {
        return res.status(500).json({ error: "Failed to transcribe audio" });
      }

      res.json({ transcription: transcription.text });
    } catch (error) {
      console.error("❌ Transcription error:", error);
      // Clean up file in case of error
      fs.unlink(inputPath, (err) => {
        if (err) console.error("Error removing temp file:", err);
      });
      
      // Provide more detailed error message
      res.status(500).json({ 
        error: "Failed to process transcription",
        details: error.message 
      });
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    // Clean up file in case of error
    if (inputPath) {
      fs.unlink(inputPath, (err) => {
        if (err) console.error("Error removing temp file:", err);
      });
    }
    res.status(500).json({ error: "Server error processing request" });
  }
});

// Protected routes (auth required)
app.use("/api/notes", authMiddleware, notesRouter);
app.use("/api/summary", authMiddleware, summaryRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  
  // Remove any temporary files if they exist
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
    });
  }
  
  res.status(500).json({ 
    error: "Something went wrong", 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Cleanup on server shutdown
process.on('SIGINT', () => {
  // Clean up uploads directory
  fs.readdir(uploadsDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(uploadsDir, file), err => {
        if (err) console.error("Error removing file during cleanup:", err);
      });
    }
  });

  process.exit();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;