import { AdapterOptions, AdapterInput } from "../types";
import { withTokenBudget } from "../index";

export type GeminiContentPart = { text: string };
export type GeminiContent = { role: "user" | "model"; parts: GeminiContentPart[] };

export type GeminiPayload = {
    model: string;
    contents: GeminiContent[];
    generationConfig?: {
        maxOutputTokens?: number;
    };
};

type GeminiAdapterOptions<TResult> = AdapterOptions<GeminiPayload, TResult> & {
    toPayload?: (input: AdapterInput) => GeminiPayload;
};

const defaultToPayload = (
    input: AdapterInput,
    model: string
): GeminiPayload => {
    const contents: GeminiContent[] = [
        { role: "user", parts: [{ text: input.prompt }] },
    ];

    for (const item of input.context) {
        contents.push({ role: "model", parts: [{ text: item }] });
    }

    return {
        model,
        contents,
        generationConfig: {
            maxOutputTokens: input.expectedOutputTokens || undefined,
        },
    };
};

export async function withGemini<TResult>(
    opts: GeminiAdapterOptions<TResult>
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
