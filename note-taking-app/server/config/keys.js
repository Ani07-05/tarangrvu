// note-taking-app/server/config/keys.js
import dotenv from 'dotenv';
dotenv.config();

export const keys = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  jwtSecret:'secretkey'
};