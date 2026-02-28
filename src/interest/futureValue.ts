import { assertNonNegative, assertPositive } from "../utils/assertions.js";

export type FutureValueParams = {
  presentValue: number;
  rate: number;
  timesPerYear: number;
  years: number;
};

/**
 * Future value of a lump sum using nominal annual `rate` compounded `timesPerYear`.
 */
export function futureValue(params: FutureValueParams): number {
  const { presentValue, rate, timesPerYear, years } = params;
  assertNonNegative(presentValue, "presentValue");
  assertPositive(timesPerYear, "timesPerYear");
  assertNonNegative(years, "years");

  if (rate === 0 || years === 0) return presentValue;

  const n = timesPerYear;
  const t = years;
  return presentValue * (1 + rate / n) ** (n * t);
}
