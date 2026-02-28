import { describe, expect, it } from "vitest";
import { loanPayment, paymentFromPresentValue, presentValueOfAnnuity } from "../src/index.js";

describe("annuities", () => {
  it("presentValueOfAnnuity and paymentFromPresentValue invert", () => {
    const pv = presentValueOfAnnuity({
      paymentPerPeriod: 100,
      ratePerPeriod: 0.01,
      periods: 36,
    });
    const pmt = paymentFromPresentValue({
      presentValue: pv,
      ratePerPeriod: 0.01,
      periods: 36,
    });
    expect(pmt).toBeCloseTo(100, 10);
  });

  it("paymentFromPresentValue matches loanPayment", () => {
    const loanPmt = loanPayment({
      principal: 100000,
      annualRate: 0.06,
      paymentsPerYear: 12,
      years: 30,
    });
    const annuityPmt = paymentFromPresentValue({
      presentValue: 100000,
      ratePerPeriod: 0.06 / 12,
      periods: 360,
    });
    expect(annuityPmt).toBeCloseTo(loanPmt, 10);
  });
});
