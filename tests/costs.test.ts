import { describe, expect, it } from "vitest";
import { estimateCost } from "../src/costs";

const usage = {
    promptTokens: 1000,
    contextTokens: 0,
    expectedOutputTokens: 500,
    totalTokens: 1500,
};

describe("estimateCost", () => {
    it("uses direct pricing when provided", () => {
        const cost = estimateCost(usage, {
            provider: "openai",
            model: "gpt-4o-mini",
            pricing: { inputPer1M: 1, outputPer1M: 2, currency: "USD" },
        });

        expect(cost?.inputCost).toBeCloseTo(0.001);
        expect(cost?.outputCost).toBeCloseTo(0.001);
        expect(cost?.source).toBe("direct");
    });

    it("uses default pricing when available", () => {
        const cost = estimateCost(usage, {
            provider: "openai",
            model: "gpt-4o-mini",
        });

        expect(cost?.source).toBe("default");
        expect(cost?.currency).toBe("USD");
    });

    it("uses overrides when provided", () => {
        const cost = estimateCost(usage, {
            provider: "openai",
            model: "gpt-4o-mini",
            pricingOverrides: {
                "gpt-4o-mini": { inputPer1M: 3, outputPer1M: 6 },
            },
        });

        expect(cost?.source).toBe("override");
        expect(cost?.inputCost).toBeCloseTo(0.003);
        expect(cost?.outputCost).toBeCloseTo(0.003);
    });
});
