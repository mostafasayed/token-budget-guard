import { estimateTokens } from "./tokenizer";

export function calculateTokenUsage(
    prompt: string,
    context: string[] = [],
    expectedOutputTokens = 0
) {
    const promptTokens = estimateTokens(prompt);
    const contextTokens = context.reduce(
        (sum, c) => sum + estimateTokens(c),
        0
    );

    return {
        promptTokens,
        contextTokens,
        expectedOutputTokens,
        totalTokens: promptTokens + contextTokens + expectedOutputTokens,
    };
}
