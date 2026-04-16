import logger from "../../config/logger";
import { genAIGeminiService } from "./GenAIGeminiService";
import { genAIOpenAIService } from "./GenAIOpenAIService";
import { MetricsRunner } from "../metrics/metricsRunner";

/**
 * Initialize AI model for test case generation
 * based on ai model configured by the user.
 * @param {string} aiModel AI model name
 * @param {string} prompt Prompt
 * @param {string} modelName Model name optional else will refer configuration.
 * @returns {Promise<string>} Generated test cases response.
 */
export const initAIModel = (
  aiModel: string,
  prompt: string,
  modelName: string,
  metricsService?: MetricsRunner 
) => {
  logger.debug(`Initializing AI model ${aiModel}`);
  switch (aiModel) {
    case "gemini":
      return genAIGeminiService(prompt, modelName, metricsService);
    case "openai":
    case "groq":
      return genAIOpenAIService(prompt, modelName, metricsService);
    default:
      throw new Error(`Unsupported AI model: ${aiModel}`);
  }
};
