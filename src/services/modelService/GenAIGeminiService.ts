import { GoogleGenAI } from "@google/genai";
import { config } from "../../config/config";
import logger from "../../config/logger";

/**
 * Google genAI client initialization
 */
const genAI = new GoogleGenAI({ apiKey: config.apiKey });
let MAX_RETRIES = 0;

/**
 * generate gemini AI Model chat completion for test case generation
 * @param {string} prompt Prompt
 * @param {string} modelName Model name
 * @returns {Promise<string>} Generated test cases response.
 */
export const genAIGeminiService = async (
  prompt: string,
  modelName = config.modelName
): Promise<string> => {
  try {
    logger.info(`Gemini model name : ${modelName}`);
    if (!config.apiKey) {
      throw new Error("Gemini API key not found");
    }
    logger.info("Gemini model initialized");
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        // This is the key part to enable thinking
        thinkingConfig: {
          includeThoughts: true, // Set to true to see the reasoning process
          thinkingBudget: 4000, // Recommended: 1024 to 4000 for coding tasks
        },
      },
    });
    logger.info("Gemini model response generated");
    return response.text || "";
  } catch (error) {
    logger.error("Gemini failed, retrying...", error);
    if (MAX_RETRIES < 2) {
      MAX_RETRIES += 1;
      logger.info(`Gemini retrying... ${MAX_RETRIES}`);
      return await genAIGeminiService(prompt, modelName);
    }
    throw new Error(
      `Gemini ai service failed after ${MAX_RETRIES} attempt(s): ${error}`
    );
  }
};
