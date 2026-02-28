import { assertFiniteNumber, assertPositive } from "../utils/assertions.js";

export type EffectiveAnnualRateParams = {
  nominalRate: number;
  timesPerYear: number;
};

/**
 * Converts a nominal annual rate to effective annual rate (EAR).
 * EAR = (1 + nominalRate/timesPerYear)^timesPerYear - 1
 */
export function effectiveAnnualRate(params: EffectiveAnnualRateParams): number {
  const { nominalRate, timesPerYear } = params;
  assertFiniteNumber(nominalRate, "nominalRate");
  assertPositive(timesPerYear, "timesPerYear");

  const r = nominalRate / timesPerYear;
  return (1 + r) ** timesPerYear - 1;
}
