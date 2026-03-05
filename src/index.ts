import {
    TokenBudgetEvent,
    TokenBudgetOptions,
    TokenBudgetResult,
    TokenBudgetTrimEvent,
    TokenUsage,
    TokenizerAdapter,
} from "./types";
import { calculateTokenUsage } from "./budget";
import { estimateTokens } from "./tokenizer";
import { trimContext } from "./strategies";
import { estimateCost } from "./costs";
export { getDefaultPricing } from "./costs";
export {
    withOpenAI,
    withAnthropic,
    withGemini,
    withBedrock,
    withAzureOpenAI,
    withCohere,
} from "./adapters";

type EstimatorState = {
    estimate: (text: string) => number;
    tokenizerName?: string;
    getTokenizerError: () => unknown | undefined;
};

function createEstimator(
    tokenizer: TokenizerAdapter | undefined,
    model: string
): EstimatorState {
    let tokenizerError: unknown | undefined;

    const estimate = (text: string) => {
        if (!tokenizer?.estimate) return estimateTokens(text);

        try {
            const value = tokenizer.estimate(text, model);
            if (value === undefined) return estimateTokens(text);
            if (!Number.isFinite(value) || value < 0) {
                throw new Error("Invalid token estimate");
            }
            return value;
        } catch (error) {
            if (tokenizerError === undefined) {
                tokenizerError = error;
            }
            return estimateTokens(text);
        }
    };

    return {
        estimate,
        tokenizerName: tokenizer?.name,
        getTokenizerError: () => tokenizerError,
    };
}

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
        tokenizer,
        onWarn,
        onTrim,
        model,
    } = opts;

    const estimator = createEstimator(tokenizer, model);
    const tokenizerMeta = estimator.tokenizerName
        ? { name: estimator.tokenizerName }
        : undefined;
    let tokenizerWarned = false;

    const maybeWarnTokenizerError = (usage: TokenUsage) => {
        const error = estimator.getTokenizerError();
        if (!error || tokenizerWarned) return;

        tokenizerWarned = true;
        const event: TokenBudgetEvent = {
            reason: "tokenizer_error",
            usage,
            maxTokens,
            model,
            strategy,
            tokenizer: tokenizerMeta,
            error,
        };

        if (onWarn) {
            onWarn(event);
        } else {
            console.warn("[token-budget] tokenizer error", error);
        }
    };

    const usage = calculateTokenUsage(
        prompt,
        context,
        expectedOutputTokens,
        estimator.estimate
    );
    maybeWarnTokenizerError(usage);

    const cost = opts.cost ? estimateCost(usage, opts.cost) ?? undefined : undefined;

    if (usage.totalTokens <= maxTokens) {
        const result = await call({ prompt, context, expectedOutputTokens });
        return { result, usage, cost };
    }

    if (strategy === "warn_only") {
        const event: TokenBudgetEvent = {
            reason: "over_budget",
            usage,
            maxTokens,
            model,
            strategy,
            tokenizer: tokenizerMeta,
        };

        if (onWarn) {
            onWarn(event);
        } else {
            console.warn("[token-budget] exceeded", usage);
        }

        const result = await call({ prompt, context, expectedOutputTokens });
        return { result, usage, cost };
    }

    if (strategy === "trim_context") {
        const remaining = maxTokens - usage.promptTokens - expectedOutputTokens;
        if (remaining <= 0) {
            throw new Error("Token budget exceeded: no room for context");
        }

        const trimmedContext = trimContext(
            context,
            remaining,
            estimator.estimate
        );

        const trimmedUsage = calculateTokenUsage(
            prompt,
            trimmedContext,
            expectedOutputTokens,
            estimator.estimate
        );
        const trimmedCost = opts.cost
            ? estimateCost(trimmedUsage, opts.cost) ?? undefined
            : undefined;

        if (trimmedUsage.totalTokens > maxTokens) {
            throw new Error(
                `Token budget exceeded (${trimmedUsage.totalTokens}/${maxTokens})`
            );
        }

        if (onTrim) {
            const event: TokenBudgetTrimEvent = {
                originalContext: context,
                trimmedContext,
                removedCount: context.length - trimmedContext.length,
                maxContextTokens: remaining,
                usage: trimmedUsage,
                model,
            };
            onTrim(event);
        }

        const result = await call({
            prompt,
            context: trimmedContext,
            expectedOutputTokens,
        });

        return { result, usage: trimmedUsage, cost: trimmedCost };
    }

    throw new Error(
        `Token budget exceeded (${usage.totalTokens}/${maxTokens})`
    );
}
