// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

import chat from "./demo.js";
dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.get("/", (req, res) => {
  console.log("sucess");
});

app.post("/bot", async (req, res) => {
  const userText = req.body.message;

  const response = await chat(userText);
  res.json(response);
});

app.post("/chat", async (req, res) => {
  const message = req.body.message;

  const prompt = `
You are CarbiforceBot, an assistant for Carbiforce (https://carbiforce.com).
Carbiforce makes CNC cutting tools like carbide inserts, end mills, drills.
Answer customer questions clearly and link products when possible.

User: ${message}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
