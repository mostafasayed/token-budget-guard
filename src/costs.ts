import { CostEstimationOptions, Pricing, ProviderId, TokenCost, TokenUsage } from "./types";

const defaultPricing: Record<ProviderId, Record<string, Pricing>> = {
    openai: {
        "gpt-5.2": { inputPer1M: 1.75, outputPer1M: 14.0, currency: "USD" },
        "gpt-5.2-pro": { inputPer1M: 21.0, outputPer1M: 168.0, currency: "USD" },
        "gpt-5.1": { inputPer1M: 1.25, outputPer1M: 10.0, currency: "USD" },
        "gpt-5": { inputPer1M: 1.25, outputPer1M: 10.0, currency: "USD" },
        "gpt-5-mini": { inputPer1M: 0.25, outputPer1M: 2.0, currency: "USD" },
        "gpt-5-nano": { inputPer1M: 0.05, outputPer1M: 0.4, currency: "USD" },
        "gpt-4.1": { inputPer1M: 2.0, outputPer1M: 8.0, currency: "USD" },
        "gpt-4.1-mini": { inputPer1M: 0.4, outputPer1M: 1.6, currency: "USD" },
        "gpt-4.1-nano": { inputPer1M: 0.1, outputPer1M: 0.4, currency: "USD" },
        "gpt-4o": { inputPer1M: 2.5, outputPer1M: 10.0, currency: "USD" },
        "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6, currency: "USD" },
        "o1": { inputPer1M: 15.0, outputPer1M: 60.0, currency: "USD" },
        "o1-pro": { inputPer1M: 150.0, outputPer1M: 600.0, currency: "USD" },
        "o3": { inputPer1M: 2.0, outputPer1M: 8.0, currency: "USD" },
        "o3-pro": { inputPer1M: 20.0, outputPer1M: 80.0, currency: "USD" },
        "o3-mini": { inputPer1M: 1.1, outputPer1M: 4.4, currency: "USD" },
    },
    anthropic: {
        "claude-opus-4.5": { inputPer1M: 5.0, outputPer1M: 25.0, currency: "USD" },
        "claude-sonnet-4.5": { inputPer1M: 3.0, outputPer1M: 15.0, currency: "USD" },
        "claude-haiku-4.5": { inputPer1M: 1.0, outputPer1M: 5.0, currency: "USD" },
    },
    google: {
        "gemini-2.5-pro": { inputPer1M: 1.25, outputPer1M: 10.0, currency: "USD" },
        "gemini-2.5-pro-gt-200k": { inputPer1M: 2.5, outputPer1M: 15.0, currency: "USD" },
        "gemini-2.5-flash": { inputPer1M: 0.3, outputPer1M: 2.5, currency: "USD" },
        "gemini-2.5-flash-lite": { inputPer1M: 0.1, outputPer1M: 0.4, currency: "USD" },
        "gemini-3-pro": { inputPer1M: 2.0, outputPer1M: 12.0, currency: "USD" },
        "gemini-embedding": { inputPer1M: 0.15, outputPer1M: 0.0, currency: "USD" },
    },
    aws_bedrock: {
        "minimax-m2": { inputPer1M: 0.3, outputPer1M: 1.2, currency: "USD" },
        "minimax-m2.1": { inputPer1M: 0.3, outputPer1M: 1.2, currency: "USD" },
        "deepseek-v3.2": { inputPer1M: 0.62, outputPer1M: 1.85, currency: "USD" },
        "gemma-3-4b": { inputPer1M: 0.04, outputPer1M: 0.08, currency: "USD" },
        "gemma-3-12b": { inputPer1M: 0.09, outputPer1M: 0.29, currency: "USD" },
        "gemma-3-27b": { inputPer1M: 0.23, outputPer1M: 0.38, currency: "USD" },
        "magistral-small-1.2": { inputPer1M: 0.5, outputPer1M: 1.5, currency: "USD" },
        "voxtral-mini-1.0": { inputPer1M: 0.04, outputPer1M: 0.04, currency: "USD" },
    },
    azure_openai: {},
    cohere: {
        "command-a": { inputPer1M: 2.5, outputPer1M: 10.0, currency: "USD" },
        "command-r+": { inputPer1M: 3.0, outputPer1M: 15.0, currency: "USD" },
        "command-r": { inputPer1M: 0.15, outputPer1M: 0.6, currency: "USD" },
        "command-r7b": { inputPer1M: 0.0375, outputPer1M: 0.15, currency: "USD" },
        "aya-expanse-8b-32b": { inputPer1M: 0.5, outputPer1M: 1.5, currency: "USD" },
    },
};

const normalizeKey = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9+.-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const normalizeProvider = (provider: ProviderId) => provider;

function resolvePricing(
    usage: TokenUsage,
    model: string,
    options: CostEstimationOptions
): { pricing: Pricing; source: TokenCost["source"]; provider?: ProviderId } | null {
    if (options.pricing) {
        return {
            pricing: {
                ...options.pricing,
                currency: options.pricing.currency ?? "USD",
            },
            source: "direct",
            provider: options.provider,
        };
    }

    const overrides = options.pricingOverrides ?? {};
    const normalizedModel = normalizeKey(model);
    const override = overrides[model] ?? overrides[normalizedModel];
    if (override) {
        return {
            pricing: { ...override, currency: override.currency ?? "USD" },
            source: "override",
            provider: options.provider,
        };
    }

    if (!options.provider) return null;
    const providerKey = normalizeProvider(options.provider);
    const providerPricing = defaultPricing[providerKey];
    if (!providerPricing) return null;

    const direct = providerPricing[model] ?? providerPricing[normalizedModel];
    if (direct) {
        return {
            pricing: { ...direct, currency: direct.currency ?? "USD" },
            source: "default",
            provider: providerKey,
        };
    }

    return null;
}

export function estimateCost(
    usage: TokenUsage,
    opts: CostEstimationOptions
): TokenCost | null {
    const model = opts.model ?? "";
    const resolved = resolvePricing(usage, model, opts);
    if (!resolved) return null;

    const inputTokens = usage.promptTokens + usage.contextTokens;
    const outputTokens = usage.expectedOutputTokens;
    const inputCost = (inputTokens / 1_000_000) * resolved.pricing.inputPer1M;
    const outputCost = (outputTokens / 1_000_000) * resolved.pricing.outputPer1M;

    return {
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
        currency: resolved.pricing.currency ?? "USD",
        source: resolved.source,
        provider: resolved.provider,
        model: opts.model,
    };
}

export function getDefaultPricing() {
    return defaultPricing;
}
