import { describe, expect, it } from "vitest";
import {
  effectiveAnnualRate,
  futureValue,
  periodsToReachGoal,
  rateToReachGoal,
  ruleOf72,
} from "../src/index.js";

describe("time value of money", () => {
  it("effectiveAnnualRate is higher than nominal when compounded", () => {
    const ear = effectiveAnnualRate({ nominalRate: 0.06, timesPerYear: 12 });
    expect(ear).toBeGreaterThan(0.06);
    expect(ear).toBeCloseTo((1 + 0.06 / 12) ** 12 - 1, 10);
  });

  it("periodsToReachGoal lump sum matches manual", () => {
    const n = periodsToReachGoal({
      principal: 1000,
      targetFutureValue: 2000,
      rate: 0.06,
      timesPerYear: 12,
    });
    const fv = futureValue({
      presentValue: 1000,
      rate: 0.06,
      timesPerYear: 12,
      years: n / 12,
    });
    expect(fv).toBeGreaterThanOrEqual(2000);
  });

  it("periodsToReachGoal returns Infinity when target is unreachable", () => {
    const noContrib = periodsToReachGoal({
      principal: 1000,
      targetFutureValue: 2000,
      rate: -0.5,
      timesPerYear: 1,
    });
    expect(noContrib).toBe(Number.POSITIVE_INFINITY);
    expect(() =>
      periodsToReachGoal({
        principal: 1000,
        targetFutureValue: 2000,
        rate: -0.5,
        timesPerYear: 1,
        contributionPerPeriod: 10,
        contributionTiming: "end",
        maxPeriods: 1000,
      }),
    ).toThrow(RangeError);
  });

  it("periodsToReachGoal throws when per-period rate is <= -1", () => {
    expect(() =>
      periodsToReachGoal({
        principal: 1000,
        targetFutureValue: 2000,
        rate: -12,
        timesPerYear: 12,
      }),
    ).toThrow(RangeError);
  });

  it("rateToReachGoal lump sum", () => {
    const r = rateToReachGoal({
      principal: 1000,
      targetFutureValue: 1500,
      periods: 24,
    });
    expect((1 + r) ** 24 * 1000).toBeCloseTo(1500, 8);
  });

  it("rateToReachGoal throws when rate is undefined for zero principal and contributions", () => {
    expect(() =>
      rateToReachGoal({
        principal: 0,
        targetFutureValue: 1500,
        periods: 24,
        contributionPerPeriod: 0,
      }),
    ).toThrow(RangeError);
  });

  it("periodsToReachGoal throws when maxPeriods cap is exceeded", () => {
    expect(() =>
      periodsToReachGoal({
        principal: 1000,
        targetFutureValue: 1_000_000,
        rate: 0.01,
        timesPerYear: 1,
        contributionPerPeriod: 1,
        maxPeriods: 10,
      }),
    ).toThrow(RangeError);
  });

  it("ruleOf72 approximate doubling", () => {
    const years = ruleOf72({ rate: 0.07 });
    expect(years).toBeCloseTo(72 / 7, 2);
    const with69 = ruleOf72({ rate: 0.07, constant: 69 });
    expect(with69).toBeCloseTo(69 / 7, 2);
  });
});
