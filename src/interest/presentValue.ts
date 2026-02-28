import { assertNonNegative, assertPositive } from "../utils/assertions.js";

export type PresentValueParams = {
  futureValue: number;
  rate: number;
  timesPerYear: number;
  years: number;
};

/**
 * Present value of a lump sum using nominal annual `rate` compounded `timesPerYear`.
 */
export function presentValue(params: PresentValueParams): number {
  const { futureValue: fv, rate, timesPerYear, years } = params;
  assertNonNegative(fv, "futureValue");
  assertPositive(timesPerYear, "timesPerYear");
  assertNonNegative(years, "years");

  if (rate === 0 || years === 0) return fv;

  const n = timesPerYear;
  const t = years;
  return fv / (1 + rate / n) ** (n * t);
}
