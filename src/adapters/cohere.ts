import { AdapterOptions, AdapterInput } from "../types";
import { withTokenBudget } from "../index";

export type CoherePayload = {
    model: string;
    message: string;
    chat_history?: Array<{ role: "USER" | "CHATBOT"; message: string }>;
    max_output_tokens?: number;
};

type CohereAdapterOptions<TResult> = AdapterOptions<CoherePayload, TResult> & {
    toPayload?: (input: AdapterInput) => CoherePayload;
};

const defaultToPayload = (input: AdapterInput, model: string): CoherePayload => {
    const chat_history = input.context.map((item) => ({
        role: "CHATBOT" as const,
        message: item,
    }));

    return {
        model,
        message: input.prompt,
        chat_history: chat_history.length ? chat_history : undefined,
        max_output_tokens: input.expectedOutputTokens || undefined,
    };
};

export async function withCohere<TResult>(
    opts: CohereAdapterOptions<TResult>
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
