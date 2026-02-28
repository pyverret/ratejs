import { assertFiniteNumber, assertPositive } from "../utils/assertions.js";

export type RuleOf72Params = {
  rate: number;
  /** Use 69 for continuous-ish approximation (e.g. daily compounding). Default 72. */
  constant?: 72 | 69;
};

/**
 * Approximate years to double a lump sum at the given annual rate.
 * rate is decimal (e.g. 0.07 for 7%). Uses rule of 72 by default, or 69 if specified.
 */
export function ruleOf72(params: RuleOf72Params): number {
  const { rate, constant = 72 } = params;
  assertFiniteNumber(rate, "rate");
  assertPositive(rate, "rate");
  return constant / 100 / rate;
}
