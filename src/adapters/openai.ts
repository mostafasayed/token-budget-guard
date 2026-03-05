import { AdapterOptions, AdapterInput } from "../types";
import { withTokenBudget } from "../index";

export type OpenAIChatPayload = {
    model: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    max_output_tokens?: number;
};

type OpenAIAdapterOptions<TResult> = AdapterOptions<OpenAIChatPayload, TResult> & {
    systemPrompt?: string;
    toPayload?: (input: AdapterInput) => OpenAIChatPayload;
};

const defaultToPayload = (
    input: AdapterInput,
    model: string,
    systemPrompt?: string
): OpenAIChatPayload => {
    const messages: OpenAIChatPayload["messages"] = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: input.prompt });
    for (const item of input.context) {
        messages.push({ role: "assistant", content: item });
    }

    return {
        model,
        messages,
        max_output_tokens: input.expectedOutputTokens || undefined,
    };
};

export async function withOpenAI<TResult>(
    opts: OpenAIAdapterOptions<TResult>
) {
    const { call, toPayload, systemPrompt, ...budget } = opts;

    return withTokenBudget<TResult>({
        ...budget,
        call: (input) => {
            const payload = toPayload
                ? toPayload(input)
                : defaultToPayload(input, budget.model, systemPrompt);
            return call(payload);
        },
    });
}
