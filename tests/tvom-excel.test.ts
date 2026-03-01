import { describe, expect, it } from "vitest";
import { fv, nper, npv, pmt, pv, rate } from "../src/index.js";

describe("excel-style tvm formulas", () => {
  it("pmt and fv are consistent with loan payoff", () => {
    const payment = pmt({
      ratePerPeriod: 0.06 / 12,
      periods: 360,
      presentValue: 250000,
      futureValue: 0,
      timing: "end",
    });

    const future = fv({
      ratePerPeriod: 0.06 / 12,
      periods: 360,
      payment,
      presentValue: 250000,
      timing: "end",
    });

    expect(future).toBeCloseTo(0, 6);
  });

  it("pv inverts fv with periodic payments", () => {
    const present = pv({
      ratePerPeriod: 0.07 / 12,
      periods: 60,
      payment: -300,
      futureValue: 10000,
      timing: "begin",
    });

    const future = fv({
      ratePerPeriod: 0.07 / 12,
      periods: 60,
      payment: -300,
      presentValue: present,
      timing: "begin",
    });

    expect(future).toBeCloseTo(10000, 8);
  });

  it("nper inverts pmt", () => {
    const payment = pmt({
      ratePerPeriod: 0.08 / 12,
      periods: 48,
      presentValue: 15000,
      futureValue: 0,
      timing: "end",
    });

    const periods = nper({
      ratePerPeriod: 0.08 / 12,
      payment,
      presentValue: 15000,
      futureValue: 0,
      timing: "end",
    });

    expect(periods).toBeCloseTo(48, 8);
  });

  it("rate inverts pmt", () => {
    const payment = pmt({
      ratePerPeriod: 0.05 / 12,
      periods: 120,
      presentValue: 50000,
      futureValue: 0,
      timing: "end",
    });

    const solvedRate = rate({
      periods: 120,
      payment,
      presentValue: 50000,
      futureValue: 0,
      timing: "end",
      guess: 0.01,
    });

    expect(solvedRate).toBeCloseTo(0.05 / 12, 8);
  });

  it("rate can converge when initial bounds miss the root", () => {
    const payment = pmt({
      ratePerPeriod: 0.01,
      periods: 120,
      presentValue: 50000,
      futureValue: 0,
      timing: "end",
    });
    const solvedRate = rate({
      periods: 120,
      payment,
      presentValue: 50000,
      futureValue: 0,
      lowerBound: 0.02,
      upperBound: 0.08,
      guess: 0.05,
    });
    expect(solvedRate).toBeCloseTo(0.01, 8);
  });

  it("rate throws when no root is found within search bounds", () => {
    expect(() =>
      rate({
        periods: 1,
        payment: 100_000_000,
        presentValue: -1,
        futureValue: 0,
        lowerBound: 0,
        upperBound: 1,
        maxIterations: 50,
      }),
    ).toThrow(RangeError);
  });

  it("nper throws when ratePerPeriod is <= -1", () => {
    expect(() =>
      nper({
        ratePerPeriod: -1,
        payment: -100,
        presentValue: 1000,
      }),
    ).toThrow(RangeError);
  });

  it("npv matches manual discounted cash flow", () => {
    const r = 0.1;
    const cashFlows = [-1000, 400, 500, 300];
    const manual = -1000 + 400 / 1.1 + 500 / 1.1 ** 2 + 300 / 1.1 ** 3;

    expect(npv({ rate: r, cashFlows })).toBeCloseTo(manual, 12);
  });

  it("documents loan sign convention with pmt", () => {
    const loanPayment = pmt({
      ratePerPeriod: 0.06 / 12,
      periods: 360,
      presentValue: 250000,
      futureValue: 0,
      timing: "end",
    });
    expect(loanPayment).toBeLessThan(0);

    const receivedPayment = pmt({
      ratePerPeriod: 0.06 / 12,
      periods: 360,
      presentValue: -250000,
      futureValue: 0,
      timing: "end",
    });
    expect(receivedPayment).toBeGreaterThan(0);
  });
});
