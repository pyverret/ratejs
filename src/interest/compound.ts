import { assertNonNegative, assertPositive } from "../utils/assertions.js";

export type CompoundParams = {
  principal: number;
  rate: number;
  timesPerYear: number;
  years: number;
};

/**
 * Computes compound growth using nominal annual `rate` compounded `timesPerYear`.
 * Returns the final amount (principal + interest).
 */
export function compound(params: CompoundParams): number {
  const { principal, rate, timesPerYear, years } = params;
  assertNonNegative(principal, "principal");
  assertPositive(timesPerYear, "timesPerYear");
  assertNonNegative(years, "years");

  if (rate === 0 || years === 0) return principal;

  const n = timesPerYear;
  const t = years;
  return principal * (1 + rate / n) ** (n * t);
}
