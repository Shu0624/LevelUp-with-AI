import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Perform a chat completion using Groq
 * @param {Array} messages - Array of message objects {role: "system"|"user"|"assistant", content: string}
 * @param {boolean} jsonMode - Ensure response is valid JSON
 * @param {number} temperature - Model temperature
 * @returns {string} - Response text
 */
export const getGroqChatCompletion = async (messages, jsonMode = false, temperature = 0.5) => {
  try {
    const options = {
      messages,
      model: "llama-3.3-70b-versatile", // Or gemma2-9b-it, mixtral-8x7b-32768 depending on needs
      temperature,
      max_tokens: 2048,
    };
    
    if (jsonMode) {
        options.response_format = { type: "json_object" };
    }

    const chatCompletion = await groq.chat.completions.create(options);
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw error; // Will be caught by service layers to trigger fallback
  }
};
