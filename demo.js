import OpenAI from "openai";
import dotenv from "dotenv";
import sysProm from "./system_prompt.js";
import readlineSync from "readline-sync";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.MY_KEY,
});
const messages = [
  {
    role: "system",
    content: sysProm,
  },
];

export async function chat(userText) {
  messages.push({
    role: "user",
    content: userText,
  });
  while (true) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: messages,
      response_format: { type: "json_object" },
    });
    const jsonData = JSON.parse(completion.choices[0].message.content.trim());
    messages.push({
      role: "assistant",
      content: jsonData,
    });
    return jsonData;
  }
}
