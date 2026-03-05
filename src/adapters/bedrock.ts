import { AdapterOptions, AdapterInput } from "../types";
import { withTokenBudget } from "../index";

export type BedrockPayload = {
    modelId: string;
    body: string;
};

type BedrockAdapterOptions<TResult> = AdapterOptions<BedrockPayload, TResult> & {
    toPayload?: (input: AdapterInput) => BedrockPayload;
};

const defaultToPayload = (input: AdapterInput, modelId: string): BedrockPayload => {
    const body = {
        prompt: input.prompt,
        context: input.context,
        max_output_tokens: input.expectedOutputTokens || undefined,
    };

    return {
        modelId,
        body: JSON.stringify(body),
    };
};

export async function withBedrock<TResult>(
    opts: BedrockAdapterOptions<TResult>
) {
    const { call, toPayload, ...budget } = opts;

    return withTokenBudget<TResult>({
        ...budget,
        call: (input) => {
            const payload = toPayload
                ? toPayload(input)
                : defaultToPayload(input, budget.model);
            return call(payload);
        },
    });
}
