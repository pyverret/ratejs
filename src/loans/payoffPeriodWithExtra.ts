import { assertFiniteNumber, assertNonNegative, assertPositive } from "../utils/assertions.js";

export type PayoffPeriodWithExtraParams = {
  principal: number;
  annualRate: number;
  paymentsPerYear: number;
  basePaymentPerPeriod: number;
  extraPaymentPerPeriod: number;
};

/**
 * Number of periods until the loan is paid off with the given base + extra payment.
 */
export function payoffPeriodWithExtra(params: PayoffPeriodWithExtraParams): number {
  const { principal, annualRate, paymentsPerYear, basePaymentPerPeriod, extraPaymentPerPeriod } =
    params;

  assertNonNegative(principal, "principal");
  assertFiniteNumber(annualRate, "annualRate");
  assertPositive(paymentsPerYear, "paymentsPerYear");
  assertNonNegative(basePaymentPerPeriod, "basePaymentPerPeriod");
  assertNonNegative(extraPaymentPerPeriod, "extraPaymentPerPeriod");

  if (principal <= 0) return 0;
  const payment = basePaymentPerPeriod + extraPaymentPerPeriod;
  if (payment <= 0) return Number.POSITIVE_INFINITY;

  const r = annualRate / paymentsPerYear;
  let balance = principal;
  let period = 0;

  while (balance > 1e-12 && period < 100000) {
    const interest = r > 0 ? balance * r : 0;
    if (payment <= interest) return Number.POSITIVE_INFINITY;
    const principalPaid = Math.min(payment - interest, balance);
    balance -= principalPaid;
    period++;
  }
  return balance <= 1e-12 ? period : Number.POSITIVE_INFINITY;
}
