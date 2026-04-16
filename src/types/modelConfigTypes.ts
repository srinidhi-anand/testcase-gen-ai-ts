
export type AI_PREFERENCE = 'high-accuracy' | 'low-cost' | 'balanced';

export type AI_MODE = 'hybrid' | 'auto' | 'manual';

export type AI_OVERRIDE_POLICY = 'never' | 'suggest' | 'auto';

export interface AIConfig {
    score: number;
    resolvedModel: string;
    recommendedModel: string;
    suggestionFlag?: string;
    llmProvider: string;
}
