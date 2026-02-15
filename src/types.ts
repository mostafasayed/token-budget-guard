export type Strategy = "fail_fast" | "trim_context" | "warn_only";

export interface TokenUsage {
    promptTokens: number;
    contextTokens: number;
    expectedOutputTokens: number;
    totalTokens: number;
}

export interface TokenBudgetResult<T> {
    result: T;
    usage: TokenUsage;
}

export interface TokenBudgetOptions<T> {
    model: string;
    maxTokens: number;
    prompt: string;
    context?: string[];
    expectedOutputTokens?: number;
    strategy?: Strategy;
    call: (payload: {
        prompt: string;
        context: string[];
        expectedOutputTokens: number;
    }) => Promise<T>;
}
