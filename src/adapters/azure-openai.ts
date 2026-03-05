import { AdapterOptions, AdapterInput } from "../types";
import { withTokenBudget } from "../index";

export type AzureOpenAIPayload = {
    deployment: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    max_output_tokens?: number;
};

type AzureOpenAIAdapterOptions<TResult> = AdapterOptions<AzureOpenAIPayload, TResult> & {
    deployment: string;
    systemPrompt?: string;
    toPayload?: (input: AdapterInput) => AzureOpenAIPayload;
};

const defaultToPayload = (
    input: AdapterInput,
    deployment: string,
    systemPrompt?: string
): AzureOpenAIPayload => {
    const messages: AzureOpenAIPayload["messages"] = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: input.prompt });
    for (const item of input.context) {
        messages.push({ role: "assistant", content: item });
    }

    return {
        deployment,
        messages,
        max_output_tokens: input.expectedOutputTokens || undefined,
    };
};

export async function withAzureOpenAI<TResult>(
    opts: AzureOpenAIAdapterOptions<TResult>
) {
    const { call, toPayload, systemPrompt, deployment, ...budget } = opts;

    return withTokenBudget<TResult>({
        ...budget,
        call: (input) => {
            const payload = toPayload
                ? toPayload(input)
                : defaultToPayload(input, deployment, systemPrompt);
            return call(payload);
        },
    });
}
