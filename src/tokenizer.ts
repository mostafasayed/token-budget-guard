export function estimateTokens(text: string): number {
    // Rough heuristic: ~4 chars per token
    return Math.ceil(text.length / 4);
}
