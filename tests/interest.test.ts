import { describe, expect, it } from "vitest";
import { compound, futureValue, investmentGrowth, presentValue } from "../src/index.js";

describe("interest", () => {
  it("compound matches futureValue for lump sum", () => {
    const c = compound({ principal: 1000, rate: 0.05, timesPerYear: 12, years: 10 });
    const fv = futureValue({ presentValue: 1000, rate: 0.05, timesPerYear: 12, years: 10 });
    expect(c).toBeCloseTo(fv, 12);
  });

  it("presentValue inverts futureValue", () => {
    const fv = futureValue({ presentValue: 2500, rate: 0.07, timesPerYear: 4, years: 3 });
    const pv = presentValue({ futureValue: fv, rate: 0.07, timesPerYear: 4, years: 3 });
    expect(pv).toBeCloseTo(2500, 10);
  });

  it("investmentGrowth returns consistent components", () => {
    const r = investmentGrowth({
      initial: 1000,
      contributionPerPeriod: 100,
      rate: 0.06,
      timesPerYear: 12,
      years: 2,
      contributionTiming: "end",
    });
    expect(r.totalContributions).toBe(100 * 24);
    expect(r.futureValue).toBeCloseTo(1000 + r.totalContributions + r.totalInterest, 12);
    expect(r.totalInterest).toBeGreaterThan(0);
  });

  it("zero rate produces zero interest", () => {
    const r = investmentGrowth({
      initial: 1000,
      contributionPerPeriod: 100,
      rate: 0,
      timesPerYear: 12,
      years: 2,
    });
    expect(r.totalInterest).toBe(0);
    expect(r.futureValue).toBe(1000 + 100 * 24);
  });
});
