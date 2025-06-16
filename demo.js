import OpenAI from "openai";
import dotenv from "dotenv";
import sysProm from "./system_prompt.js";
import readlineSync from "readline-sync";
import db from "./database.js"; // Import the database module
import staticPages from "./staticContent.js"; // Import static pages
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.MY_KEY,
});
// Global messages array removed

export default async function chat(userText, conversationHistory) {
  const systemMessage = { role: "system", content: sysProm };

  // Initialize currentMessages based on conversationHistory
  // It's expected that if conversationHistory is provided, it's the complete history.
  // If conversationHistory is null/undefined/empty, it's a new chat.
  let currentMessages = [];
  if (conversationHistory && conversationHistory.length > 0) {
    currentMessages = [...conversationHistory]; // Create a mutable copy
  } else {
    currentMessages = [systemMessage];
  }

  currentMessages.push({
    role: "user",
    content: userText,
  });

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: currentMessages, // Use local currentMessages
      response_format: { type: "json_object" },
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error.message);
    // Return the error and the history up to the point of error
    return {
      aiResponse: {
        type: "Error",
        source: "OpenAI",
        message: "Error communicating with AI service.",
        error: error.message,
      },
      updatedHistory: currentMessages,
    };
  }

  // Proceed only if completion was successful
  const aiRawResponseContent = completion.choices[0].message.content.trim();
  const jsonData = JSON.parse(aiRawResponseContent);

  // Add AI's original response to currentMessages for history
  currentMessages.push({
    role: "assistant",
    content: aiRawResponseContent, // Store the raw string content from AI
  });

  // jsonData is now the object to be potentially enriched
  if (jsonData.type === 'ProductInfo' && jsonData.query) {
      try {
        const products = await db.executeQuery(jsonData.query);
        if (products.length > 0) {
          jsonData.products = products;
          jsonData.displayMessage = `I found ${products.length} product(s) matching your query.`; // Simple count for now
        } else {
          jsonData.products = [];
          jsonData.displayMessage = "I couldn't find any products matching your criteria.";
        }
      } catch (error) {
        console.error("Database query error:", error);
        jsonData.products = [];
        jsonData.displayMessage = "I encountered an issue trying to fetch product information.";
      }
    } else if (jsonData.type === 'PageInfo' && jsonData.pageKey) {
      const pageKey = jsonData.pageKey;
      const content = staticPages[pageKey];
      if (content) {
        jsonData.content = content;
        jsonData.displayMessage = `Here is the information you requested about "${pageKey}":`;
      } else {
        console.error(`Error: PageKey "${pageKey}" not found in staticContent.js`);
        jsonData.content = "Sorry, I don't have specific information for that page key.";
        jsonData.displayMessage = "I couldn't retrieve the specific information page you asked for.";
      }
    }
    // Return the (potentially enriched) jsonData and the updated history
    return {
      aiResponse: jsonData,
      updatedHistory: currentMessages,
    };
  // The while(true) loop was removed, so the function naturally ends here after processing.
}
