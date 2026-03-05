import { describe, expect, it } from "vitest";
import { trimContext } from "../src/strategies";

const estimate = (text: string) => Math.ceil(text.length / 4);

describe("trimContext", () => {
    it("keeps most recent items within budget", () => {
        const context = ["first", "second", "third", "fourth"];
        const trimmed = trimContext(context, 3, estimate);

        expect(trimmed).toEqual(["fourth"]);
    });

    it("returns empty when budget is zero", () => {
        const context = ["one", "two"];
        const trimmed = trimContext(context, 0, estimate);

        expect(trimmed).toEqual([]);
    });
});
