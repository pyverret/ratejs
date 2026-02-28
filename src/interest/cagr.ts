import { assertPositive } from "../utils/assertions.js";

export type CagrParams = {
  startValue: number;
  endValue: number;
  years: number;
};

/**
 * Compound annual growth rate (CAGR) between start and end value over the given years.
 * CAGR = (endValue/startValue)^(1/years) - 1
 */
export function cagr(params: CagrParams): number {
  const { startValue, endValue, years } = params;
  assertPositive(startValue, "startValue");
  assertPositive(years, "years");
  if (endValue <= 0) return -1;
  return (endValue / startValue) ** (1 / years) - 1;
}
