import { describe, expect, it } from "vitest";
import { amortizationSchedule, loanPayment } from "../src/index.js";

describe("loans", () => {
  it("loanPayment amortizes to ~0 balance", () => {
    const payment = loanPayment({
      principal: 200000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
    });
    expect(payment).toBeGreaterThan(0);

    const { schedule } = amortizationSchedule({
      principal: 200000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
    });
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule.at(-1)?.balance ?? NaN).toBeCloseTo(0, 8);
  });

  it("extra payments reduce schedule length", () => {
    const base = amortizationSchedule({
      principal: 10000,
      annualRate: 0.08,
      paymentsPerYear: 12,
      years: 5,
    });
    const extra = amortizationSchedule({
      principal: 10000,
      annualRate: 0.08,
      paymentsPerYear: 12,
      years: 5,
      extraPaymentPerPeriod: 50,
    });
    expect(extra.schedule.length).toBeLessThan(base.schedule.length);
    expect(extra.totalInterest).toBeLessThan(base.totalInterest);
  });
});
