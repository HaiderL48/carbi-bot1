// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Removed

import chat from "./demo.js";
dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Removed
app.get("/", (req, res) => {
  console.log("sucess");
});

app.post("/bot", async (req, res, next) => { // Added next for error handling
  const userText = req.body.message;
  let conversationHistory = req.body.history;

  // Validate userText
  if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
    return res.status(400).json({ error: "Bad Request: 'message' is required in the request body and must be a non-empty string." });
  }

  // Validate conversationHistory: if provided, it must be an array.
  // If malformed, treat as no history provided and log a warning.
  if (conversationHistory !== undefined && !Array.isArray(conversationHistory)) {
    console.warn("Warning: 'history' field was provided but was not an array. Proceeding as if no history was provided.");
    conversationHistory = undefined;
  }

  try {
    // chat() is expected to return a structure like { aiResponse: ..., updatedHistory: ... }
    // or { aiResponse: { type: "Error", ... }, updatedHistory: ... } if it handles an error internally.
    const responseFromChat = await chat(userText, conversationHistory);
    res.json(responseFromChat);
  } catch (error) {
    // If chat() itself throws an unexpected error (not an internally handled one),
    // pass it to the global error handler.
    console.error("Unexpected error in /bot route calling chat():", error);
    next(error);
  }
});

// Removed app.post("/chat", ...) route for Gemini

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Global error-handling middleware
// This should be the last middleware added
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err); // Delegate to default Express error handler
  }
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong on the server."
  });
});
