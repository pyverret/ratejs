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
});
