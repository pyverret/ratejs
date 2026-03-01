import { assertFiniteNumber } from "../utils/assertions.js";

export type NpvParams = {
  rate: number;
  cashFlows: number[];
};

/**
 * Net present value at a discount `rate`.
 * cashFlows[0] is the period-0 cash flow.
 */
export function npv(params: NpvParams): number {
  const { rate, cashFlows } = params;
  assertFiniteNumber(rate, "rate");
  if (rate <= -1) throw new RangeError("rate must be > -1");
  if (cashFlows.length === 0) return 0;

  let sum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (cf === undefined) continue;
    assertFiniteNumber(cf, `cashFlows[${t}]`);
    sum += cf / (1 + rate) ** t;
  }
  return sum;
}
