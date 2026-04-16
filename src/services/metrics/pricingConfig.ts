export const modelsPricing = {
    "gpt-4o": {
        inputCostPerToken: 5 / 1_000_000, // inputCostPerToken  
        outputCostPerToken: 15 / 1_000_000 // outputCostPerToken
    },
    "gemini-1.5-pro": {
        inputCostPerToken: 3.5 / 1_000_000,
        outputCostPerToken: 10.5 / 1_000_000
    },
    "gemini-2.5-flash": {
        inputCostPerToken: 3.5 / 1_000_000,
        outputCostPerToken: 10.5 / 1_000_000
    },
    "llama-3.3-70b-versatile": {
        inputCostPerToken: 0.27 / 1_000_000,
        outputCostPerToken: 0.27 / 1_000_000
    }
}

export type models = keyof typeof modelsPricing | null;