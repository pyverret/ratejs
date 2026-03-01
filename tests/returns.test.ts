import { describe, expect, it } from "vitest";
import { cagr, irr } from "../src/index.js";

describe("returns", () => {
  it("cagr from start to end", () => {
    const r = cagr({ startValue: 1000, endValue: 2000, years: 10 });
    expect(1000 * (1 + r) ** 10).toBeCloseTo(2000, 8);
  });

  it("irr npv is zero at returned rate", () => {
    const rate = irr({ cashFlows: [-1000, 300, 400, 500] });
    const npv = -1000 + 300 / (1 + rate) + 400 / (1 + rate) ** 2 + 500 / (1 + rate) ** 3;
    expect(npv).toBeCloseTo(0, 8);
  });

  it("irr requires at least one positive and one negative cash flow", () => {
    expect(() => irr({ cashFlows: [100, 200, 300] })).toThrow(RangeError);
    expect(() => irr({ cashFlows: [-100, -200, -300] })).toThrow(RangeError);
  });

  it("irr throws for empty cash flow list", () => {
    expect(() => irr({ cashFlows: [] })).toThrow(RangeError);
  });

  it("irr throws when root is outside configured bounds", () => {
    expect(() =>
      irr({
        cashFlows: [-1, 100_000_000],
        lowerBound: 0,
        upperBound: 1,
        maxIterations: 50,
      }),
    ).toThrow(RangeError);
  });

  it("irr can still converge when initial bounds miss the root", () => {
    const r = irr({
      cashFlows: [-1000, 1100],
      lowerBound: 0.2,
      upperBound: 0.5,
      guess: 0.3,
    });
    expect(r).toBeCloseTo(0.1, 8);
  });
});
