import { describe, expect, it } from "vitest";
import { roundToCurrency } from "../src/index.js";

describe("utils", () => {
  it("roundToCurrency half-up 2 decimals", () => {
    expect(roundToCurrency({ value: 2.125 })).toBe(2.13);
    expect(roundToCurrency({ value: 2.124 })).toBe(2.12);
  });

  it("roundToCurrency half-even", () => {
    expect(roundToCurrency({ value: 2.125, mode: "half-even" })).toBe(2.12);
    expect(roundToCurrency({ value: 2.255, mode: "half-even" })).toBe(2.26);
  });

  it("roundToCurrency custom decimals", () => {
    expect(roundToCurrency({ value: 2.1256, decimals: 3 })).toBe(2.126);
  });
});
