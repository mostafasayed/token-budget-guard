import { describe, expect, it } from "vitest";
import { calculateTokenUsage } from "../src/budget";

const estimate = (text: string) => Math.ceil(text.length / 4);

describe("calculateTokenUsage", () => {
    it("calculates token totals", () => {
        const usage = calculateTokenUsage(
            "hello",
            ["world"],
            5,
            estimate
        );

        expect(usage.promptTokens).toBe(2);
        expect(usage.contextTokens).toBe(2);
        expect(usage.expectedOutputTokens).toBe(5);
        expect(usage.totalTokens).toBe(9);
    });
});
