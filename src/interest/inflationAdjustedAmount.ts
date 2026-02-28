import { assertFiniteNumber, assertNonNegative } from "../utils/assertions.js";

export type InflationAdjustedAmountParams = {
  amount: number;
  annualInflationRate: number;
  years: number;
  direction: "toPast" | "toFuture";
};

/**
 * Purchasing power across time. toPast: amount/(1+rate)^years. toFuture: amount*(1+rate)^years.
 */
export function inflationAdjustedAmount(params: InflationAdjustedAmountParams): number {
  const { amount, annualInflationRate, years, direction } = params;
  assertFiniteNumber(amount, "amount");
  assertFiniteNumber(annualInflationRate, "annualInflationRate");
  assertNonNegative(years, "years");
  const factor = (1 + annualInflationRate) ** years;
  return direction === "toPast" ? amount / factor : amount * factor;
}
