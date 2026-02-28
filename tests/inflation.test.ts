import { describe, expect, it } from "vitest";
import { inflationAdjustedAmount, realReturn } from "../src/index.js";

describe("inflation", () => {
  it("realReturn strips inflation", () => {
    const real = realReturn({ nominalReturn: 0.07, inflationRate: 0.02 });
    expect(real).toBeCloseTo(1.07 / 1.02 - 1, 10);
  });

  it("inflationAdjustedAmount toPast reduces amount", () => {
    const past = inflationAdjustedAmount({
      amount: 100,
      annualInflationRate: 0.03,
      years: 10,
      direction: "toPast",
    });
    expect(past).toBeLessThan(100);
    expect(past).toBeCloseTo(100 / 1.03 ** 10, 8);
  });

  it("inflationAdjustedAmount toFuture increases amount", () => {
    const future = inflationAdjustedAmount({
      amount: 100,
      annualInflationRate: 0.03,
      years: 10,
      direction: "toFuture",
    });
    expect(future).toBeGreaterThan(100);
    expect(future).toBeCloseTo(100 * 1.03 ** 10, 8);
  });
});
