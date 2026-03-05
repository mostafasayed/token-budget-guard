export function calculateTokenUsage(
    prompt: string,
    context: string[] = [],
    expectedOutputTokens = 0,
    estimate: (text: string) => number
) {
    const promptTokens = estimate(prompt);
    const contextTokens = context.reduce((sum, c) => sum + estimate(c), 0);

    return {
        promptTokens,
        contextTokens,
        expectedOutputTokens,
        totalTokens: promptTokens + contextTokens + expectedOutputTokens,
    };
}
