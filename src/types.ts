export type Strategy = "fail_fast" | "trim_context" | "warn_only";

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
