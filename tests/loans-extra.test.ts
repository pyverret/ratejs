import { describe, expect, it } from "vitest";
import {
  amortizationSchedule,
  loanPayment,
  payoffPeriodWithExtra,
  remainingBalance,
} from "../src/index.js";

describe("loans extra", () => {
  it("remainingBalance decreases over time", () => {
    const after12 = remainingBalance({
      principal: 200000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
      afterPeriodNumber: 12,
    });
    const after120 = remainingBalance({
      principal: 200000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
      afterPeriodNumber: 120,
    });
    expect(after12).toBeLessThan(200000);
    expect(after120).toBeLessThan(after12);
  });

  it("payoffPeriodWithExtra matches schedule length with extra", () => {
    const payment = loanPayment({
      principal: 100000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
    });
    const periods = payoffPeriodWithExtra({
      principal: 100000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      basePaymentPerPeriod: payment,
      extraPaymentPerPeriod: 100,
    });
    const { schedule } = amortizationSchedule({
      principal: 100000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
      extraPaymentPerPeriod: 100,
    });
    expect(periods).toBe(schedule.length);
  });

  it("payoffPeriodWithExtra returns Infinity when payment does not cover interest", () => {
    const periods = payoffPeriodWithExtra({
      principal: 1000,
      annualRate: 0.12,
      paymentsPerYear: 12,
      basePaymentPerPeriod: 5,
      extraPaymentPerPeriod: 0,
    });
    expect(periods).toBe(Number.POSITIVE_INFINITY);
  });
});
