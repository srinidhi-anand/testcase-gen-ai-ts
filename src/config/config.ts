import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configuration for the application
 */
export const config = {
  general: {
    llm: process.env.LLM || process.env.AI_MODEL || "", // gemini
  },
  model: {
    name: process.env.MODEL || process.env.AI_MODEL_NAME || "", // "gemini-2.5-flash"
    apiKey: process.env.AI_API_KEY || "",
    preference: process.env.AI_PREFERENCE || "balanced",
    mode: process.env.AI_MODE || (process.env.MODEL || process.env.AI_MODEL_NAME ? "manual" : "auto"),
    overridePolicy: process.env.AI_OVERRIDE_POLICY || (process.env.MODEL || process.env.AI_MODEL_NAME ? "suggest" : "auto"),
  },
  server: {
    node_environment: process.env.NODE_ENV || 'development',
  }
};

// --- Deprecation Warnings Lifecycle ---
if (process.env.AI_MODEL_NAME) {
  logger.warn("⚠️ DEPRECATION WARNING [ts-genai-test]: 'AI_MODEL_NAME' is deprecated. Please migrate to 'MODEL' in your .env. Support will be dropped in future versions.");
}

if (process.env.AI_MODEL) {
  logger.warn("⚠️ DEPRECATION WARNING [ts-genai-test]: 'AI_MODEL' is deprecated. Please migrate to 'LLM' in your .env. Support will be dropped in future versions.");
}

