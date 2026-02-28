import { assertNonNegative, assertPositive } from "../utils/assertions.js";

export type LoanPaymentParams = {
  principal: number;
  annualRate: number;
  paymentsPerYear: number;
  years: number;
};

/**
 * Fixed periodic payment for an amortizing loan.
 *
 * - `annualRate` is nominal annual rate (e.g. 0.06 for 6%)
 * - payment returned is per period (`paymentsPerYear`)
 */
export function loanPayment(params: LoanPaymentParams): number {
  const { principal, annualRate, paymentsPerYear, years } = params;
  assertNonNegative(principal, "principal");
  assertPositive(paymentsPerYear, "paymentsPerYear");
  assertNonNegative(years, "years");

  const n = Math.round(paymentsPerYear * years);
  if (n === 0) return 0;

  const r = annualRate / paymentsPerYear;
  if (r === 0) return principal / n;

  return (r * principal) / (1 - (1 + r) ** -n);
}
