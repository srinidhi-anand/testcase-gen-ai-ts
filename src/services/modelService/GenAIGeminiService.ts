import { GoogleGenAI } from "@google/genai";
import { config } from "../../config/config";
import logger from "../../config/logger";
import { MetricsRunner } from "../metrics/metricsRunner";

/**
 * Google genAI client initialization
 */
const genAI = new GoogleGenAI({ apiKey: config.model.apiKey });

/**
 * generate gemini AI Model chat completion for test case generation
 * @param {string} prompt Prompt
 * @param {string} modelName Model name
 * @returns {Promise<string>} Generated test cases response.
 */
export const genAIGeminiService = async (
  prompt: string,
  modelName: string,
  metricsService?: MetricsRunner,
  retryCount: number = 0
): Promise<string> => {
  try {
    logger.info(`Gemini model name : ${modelName}`);
    if (!config.model.apiKey) {
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
    
    if (metricsService) {
        metricsService.parseIOTokens(response);
    }
    
    return response.text || "";
  } catch (error) {
    logger.error("Gemini failed, retrying...", error);
    if (retryCount < 2) {
      logger.info(`Gemini retrying... attempt ${retryCount + 1}`);
      return await genAIGeminiService(prompt, modelName, metricsService, retryCount + 1);
    }
    throw new Error(
      `Gemini ai service failed after ${retryCount} attempt(s): ${error}`
    );
  }
};
