import { assertNonNegative, assertPositive } from "../utils/assertions.js";
import { loanPayment } from "./loanPayment.js";

export type RemainingBalanceParams = {
  principal: number;
  annualRate: number;
  paymentsPerYear: number;
  years: number;
  afterPeriodNumber: number;
};

/**
 * Remaining balance after a given number of payments on an amortizing loan.
 */
export function remainingBalance(params: RemainingBalanceParams): number {
  const { principal, annualRate, paymentsPerYear, years, afterPeriodNumber } = params;
  assertNonNegative(principal, "principal");
  assertPositive(paymentsPerYear, "paymentsPerYear");
  assertNonNegative(years, "years");
  assertNonNegative(afterPeriodNumber, "afterPeriodNumber");

  const n = Math.round(paymentsPerYear * years);
  if (n === 0 || afterPeriodNumber >= n) return 0;
  if (afterPeriodNumber <= 0) return principal;

  const payment = loanPayment({ principal, annualRate, paymentsPerYear, years });
  const r = annualRate / paymentsPerYear;
  const k = afterPeriodNumber;

  if (r === 0) return Math.max(0, principal - payment * k);
  const balance = principal * (1 + r) ** k - payment * (((1 + r) ** k - 1) / r);
  return Math.max(0, balance);
}
