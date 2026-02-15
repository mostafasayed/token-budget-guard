import { TokenBudgetOptions, TokenBudgetResult } from "./types";
import { calculateTokenUsage } from "./budget";
import { estimateTokens } from "./tokenizer";
import { trimContext } from "./strategies";

export async function withTokenBudget<T>(
    opts: TokenBudgetOptions<T>
): Promise<TokenBudgetResult<T>> {
    const {
        prompt,
        context = [],
        expectedOutputTokens = 0,
        maxTokens,
        strategy = "fail_fast",
        call,
    } = opts;

    const usage = calculateTokenUsage(
        prompt,
        context,
        expectedOutputTokens
    );

    if (usage.totalTokens <= maxTokens) {
        const result = await call({ prompt, context, expectedOutputTokens });
        return { result, usage };
    }

    if (strategy === "warn_only") {
        console.warn("[token-budget] exceeded", usage);
        const result = await call({ prompt, context, expectedOutputTokens });
        return { result, usage };
    }

    if (strategy === "trim_context") {
        const remaining = maxTokens - usage.promptTokens - expectedOutputTokens;
        if (remaining <= 0) {
            throw new Error("Token budget exceeded: no room for context");
        }

        const trimmedContext = trimContext(
            context,
            remaining,
            estimateTokens
        );

        const trimmedUsage = calculateTokenUsage(
            prompt,
            trimmedContext,
            expectedOutputTokens
        );

        if (trimmedUsage.totalTokens > maxTokens) {
            throw new Error(
                `Token budget exceeded (${trimmedUsage.totalTokens}/${maxTokens})`
            );
        }

        const result = await call({
            prompt,
            context: trimmedContext,
            expectedOutputTokens,
        });

        return { result, usage: trimmedUsage };
    }

    throw new Error(
        `Token budget exceeded (${usage.totalTokens}/${maxTokens})`
    );
}
