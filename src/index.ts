import { TokenBudgetOptions } from "./types";
import { calculateTokenUsage } from "./budget";
import { estimateTokens } from "./tokenizer";
import { trimContext } from "./strategies";

export async function withTokenBudget<T>(
    opts: TokenBudgetOptions<T>
): Promise<T> {
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
        return call({ prompt, context, expectedOutputTokens });
    }

    if (strategy === "warn_only") {
        console.warn("[token-budget] exceeded", usage);
        return call({ prompt, context, expectedOutputTokens });
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

        return call({
            prompt,
            context: trimmedContext,
            expectedOutputTokens,
        });
    }

    throw new Error(
        `Token budget exceeded (${usage.totalTokens}/${maxTokens})`
    );
}
