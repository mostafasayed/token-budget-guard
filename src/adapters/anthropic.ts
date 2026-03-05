import { AdapterOptions, AdapterInput } from "../types";
import { withTokenBudget } from "../index";

export type AnthropicMessage = { role: "user" | "assistant"; content: string };

export type AnthropicPayload = {
    model: string;
    messages: AnthropicMessage[];
    max_tokens?: number;
    system?: string;
};

type AnthropicAdapterOptions<TResult> = AdapterOptions<AnthropicPayload, TResult> & {
    systemPrompt?: string;
    toPayload?: (input: AdapterInput) => AnthropicPayload;
};

const defaultToPayload = (
    input: AdapterInput,
    model: string,
    systemPrompt?: string
): AnthropicPayload => {
    const messages: AnthropicMessage[] = [
        { role: "user", content: input.prompt },
    ];

    for (const item of input.context) {
        messages.push({ role: "assistant", content: item });
    }

    return {
        model,
        messages,
        system: systemPrompt,
        max_tokens: input.expectedOutputTokens || undefined,
    };
};

export async function withAnthropic<TResult>(
    opts: AnthropicAdapterOptions<TResult>
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
