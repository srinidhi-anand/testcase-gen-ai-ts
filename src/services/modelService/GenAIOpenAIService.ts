import { config } from "../../config/config";
import logger from "../../config/logger";
import OpenAI from "openai";

let urlObject = {};

/**
 * If model is groq, use groq url
 */
if (config.model === "groq") {
  urlObject = { baseURL: "https://api.groq.com/openai/v1" };
}

/**
 * OpenAI client initialization
 */
const openAIClient = new OpenAI({
  ...urlObject,
  apiKey: config.apiKey,
});
let MAX_RETRIES = 0;

/**
 * generate openai AI Model chat completion for test case generation
 * @param {string} prompt Prompt
 * @param {string} modelName Model name
 * @returns {Promise<string>} Generated test cases response.
 */
export const genAIOpenAIService = async (
  prompt: string,
  modelName = config.modelName
): Promise<string> => {
  try {
    logger.info(` open ai model name : ${modelName}`);
    if (!config.apiKey) {
      throw new Error(" open ai API key not found");
    }
    logger.info(" open ai model initialized");
    const response = await openAIClient.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    logger.info(" open ai model response generated");
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    logger.error(" open ai service failed, retrying...", error);
    if (MAX_RETRIES < 2) {
      MAX_RETRIES += 1;
      logger.info(` open ai retrying... ${MAX_RETRIES}`);
      return await genAIOpenAIService(prompt);
    }
    throw new Error(
      `open ai service failed after ${MAX_RETRIES} attempt(s): ${error}`
    );
  }
};
