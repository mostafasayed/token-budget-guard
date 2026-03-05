export type Strategy = "fail_fast" | "trim_context" | "warn_only";

export interface TokenUsage {
    promptTokens: number;
    contextTokens: number;
    expectedOutputTokens: number;
    totalTokens: number;
}

export type TokenizerAdapter = {
    estimate: (text: string, model?: string) => number;
    name?: string;
};

export type TokenBudgetWarnReason = "over_budget" | "tokenizer_error";

export interface TokenBudgetEvent {
    reason: TokenBudgetWarnReason;
    usage: TokenUsage;
    maxTokens: number;
    model: string;
    strategy: Strategy;
    tokenizer?: { name?: string };
    error?: unknown;
}

export interface TokenBudgetTrimEvent {
    originalContext: string[];
    trimmedContext: string[];
    removedCount: number;
    maxContextTokens: number;
    usage: TokenUsage;
    model: string;
}

export type ProviderId =
    | "openai"
    | "anthropic"
    | "google"
    | "aws_bedrock"
    | "azure_openai"
    | "cohere";

export type Pricing = {
    inputPer1M: number;
    outputPer1M: number;
    currency?: string;
};

export interface CostEstimationOptions {
    provider?: ProviderId;
    model?: string;
    pricing?: Pricing;
    pricingOverrides?: Record<string, Pricing>;
}

export interface TokenCost {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
    currency: string;
    source: "default" | "override" | "direct";
    provider?: ProviderId;
    model?: string;
}

export interface TokenBudgetResult<T> {
    result: T;
    usage: TokenUsage;
    cost?: TokenCost;
}

export interface TokenBudgetOptions<T> {
    model: string;
    maxTokens: number;
    prompt: string;
    context?: string[];
    expectedOutputTokens?: number;
    strategy?: Strategy;
    tokenizer?: TokenizerAdapter;
    cost?: CostEstimationOptions;
    onWarn?: (event: TokenBudgetEvent) => void;
    onTrim?: (event: TokenBudgetTrimEvent) => void;
    call: (payload: {
        prompt: string;
        context: string[];
        expectedOutputTokens: number;
    }) => Promise<T>;
}

export type AdapterInput = {
    prompt: string;
    context: string[];
    expectedOutputTokens: number;
};

export type AdapterOptions<TPayload, TResult> = Omit<
    TokenBudgetOptions<TResult>,
    "call"
> & {
    call: (payload: TPayload) => Promise<TResult>;
    toPayload?: (input: AdapterInput) => TPayload;
};
