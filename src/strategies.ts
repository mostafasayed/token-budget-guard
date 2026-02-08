export function trimContext(
    context: string[],
    maxContextTokens: number,
    estimate: (text: string) => number
) {
    let tokens = 0;
    const trimmed: string[] = [];

    for (let i = context.length - 1; i >= 0; i--) {
        const t = estimate(context[i]);
        if (tokens + t > maxContextTokens) break;
        tokens += t;
        trimmed.unshift(context[i]);
    }

    return trimmed;
}
