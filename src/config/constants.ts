import dotenv from "dotenv";
dotenv.config();

export const AI_CONSTANTS = {
    FALLBACK_FREE_MODEL: process.env.FALLBACK_FREE_MODEL || "gemini-1.5-flash",
    HIGH_ACCURACY_MODEL: process.env.HIGH_ACCURACY_MODEL || "gpt-4o",
    BALANCED_MODEL: process.env.BALANCED_MODEL || "gpt-4o-mini",
};

export enum OVERRIDE_POLICY {
    NEVER = 'never',
    SUGGEST = 'suggest',
    AUTO = 'auto'
}

export enum MODEL_PREFERENCE {
    HIGH_ACCURACY = 'high-accuracy',
    LOW_COST = 'low-cost',
    BALANCED = 'balanced'
}

export const MODEL_ADAPTER = {
    [MODEL_PREFERENCE.HIGH_ACCURACY]: {
        LLM_PROVIDER: 'openai',
        COMPLEXITY_SCORE: 60,
        RECOMMENDED_MODEL: AI_CONSTANTS.HIGH_ACCURACY_MODEL,
        SUGGESTIONS: "High complexity score or high-accuracy requested",
    },
    [MODEL_PREFERENCE.LOW_COST]: {
        LLM_PROVIDER: 'gemini',
        COMPLEXITY_SCORE: 0,
        RECOMMENDED_MODEL: AI_CONSTANTS.FALLBACK_FREE_MODEL,
        SUGGESTIONS: "Low complexity (Default Fallback)",
    },
    [MODEL_PREFERENCE.BALANCED]: {
        LLM_PROVIDER: 'openai',
        COMPLEXITY_SCORE: 25,
        RECOMMENDED_MODEL: AI_CONSTANTS.BALANCED_MODEL,
        SUGGESTIONS: "Moderate complexity indicating a balanced requirement",
    }
}