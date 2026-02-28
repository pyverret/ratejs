import { assertFiniteNumber } from "../utils/assertions.js";

export type RealReturnParams = { nominalReturn: number; inflationRate: number };

export function realReturn(params: RealReturnParams): number {
  const { nominalReturn, inflationRate } = params;
  assertFiniteNumber(nominalReturn, "nominalReturn");
  assertFiniteNumber(inflationRate, "inflationRate");
  if (inflationRate <= -1) return NaN;
  return (1 + nominalReturn) / (1 + inflationRate) - 1;
}
