import { describe, expect, it, vi } from "vitest";
import { withTokenBudget } from "../src/index";

describe("withTokenBudget", () => {
    it("calls and returns usage when within budget", async () => {
        const call = vi.fn(async () => "ok");
        const result = await withTokenBudget({
            model: "gpt-4o-mini",
            maxTokens: 100,
            prompt: "hello",
            expectedOutputTokens: 5,
            call,
        });

        expect(result.result).toBe("ok");
        expect(result.usage.totalTokens).toBeGreaterThan(0);
        expect(call).toHaveBeenCalledTimes(1);
    });

    it("warn_only triggers onWarn and still calls", async () => {
        const call = vi.fn(async () => "ok");
        const onWarn = vi.fn();

        const result = await withTokenBudget({
            model: "gpt-4o-mini",
            maxTokens: 1,
            prompt: "this exceeds",
            expectedOutputTokens: 1,
            strategy: "warn_only",
            onWarn,
            call,
        });

        expect(result.result).toBe("ok");
        expect(onWarn).toHaveBeenCalledTimes(1);
        expect(call).toHaveBeenCalledTimes(1);
    });

    it("trim_context trims and uses trimmed context", async () => {
        const call = vi.fn(async () => "ok");
        const onTrim = vi.fn();

        const result = await withTokenBudget({
            model: "gpt-4o-mini",
            maxTokens: 5,
            prompt: "hello",
            context: ["one", "two", "three"],
            expectedOutputTokens: 1,
            strategy: "trim_context",
            onTrim,
            call,
        });

        expect(result.result).toBe("ok");
        expect(onTrim).toHaveBeenCalledTimes(1);
        const payload = call.mock.calls[0][0];
        expect(payload.context.length).toBeLessThan(3);
    });
});
