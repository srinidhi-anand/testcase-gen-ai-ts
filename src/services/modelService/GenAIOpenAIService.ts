import { config } from "../../config/config";
import logger from "../../config/logger";
import OpenAI from "openai";
import { MetricsRunner } from "../metrics/metricsRunner";

let urlObject = {};

/**
 * If model is groq, use groq url
 */
if (config.general.llm === "groq") {
  urlObject = { baseURL: "https://api.groq.com/openai/v1" };
}

/**
 * OpenAI client initialization
 */
const openAIClient = new OpenAI({
  ...urlObject,
  apiKey: config.model.apiKey,
});

/**
 * generate openai AI Model chat completion for test case generation
 * @param {string} prompt Prompt
 * @param {string} modelName Model name
 * @returns {Promise<string>} Generated test cases response.
 */
export const genAIOpenAIService = async (
  prompt: string,
  modelName: string,
  metricsService?: MetricsRunner,
  retryCount: number = 0
): Promise<string> => {
  try {
    logger.info(` open ai model name : ${modelName}`);
    if (!config.model.apiKey) {
      throw new Error(" open ai API key not found");
    }
    logger.info(" open ai model initialized");
    const response = await openAIClient.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    logger.info(" open ai model response generated");
    
    if (metricsService) {
        metricsService.parseIOTokens(response);
    }

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    logger.error(" open ai service failed, retrying...", error);
    if (retryCount < 2) {
      logger.info(` open ai retrying... attempt ${retryCount + 1}`);
      return await genAIOpenAIService(prompt, modelName, metricsService, retryCount + 1);
    }
    throw new Error(
      `open ai service failed after ${retryCount} attempt(s): ${error}`
    );
  }
};
