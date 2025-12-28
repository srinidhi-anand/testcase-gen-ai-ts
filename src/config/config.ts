import dotenv from "dotenv";
dotenv.config();

/**
 * Configuration for the application
 */
export const config = {
  model: process.env.AI_MODEL || "",
  modelName: process.env.AI_MODEL_NAME || "",
  apiKey: process.env.AI_API_KEY || "",
};
