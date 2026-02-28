import { assertFiniteNumber, assertNonNegative, assertPositive } from "../utils/assertions.js";

export type PeriodsToReachGoalParams = {
  principal: number;
  targetFutureValue: number;
  rate: number;
  timesPerYear: number;
  contributionPerPeriod?: number;
  contributionTiming?: "end" | "begin";
};

/**
 * Number of compounding periods until future value reaches the goal.
 * With no contributions: closed form. With contributions: iterative.
 */
export function periodsToReachGoal(params: PeriodsToReachGoalParams): number {
  const {
    principal,
    targetFutureValue,
    rate,
    timesPerYear,
    contributionPerPeriod = 0,
    contributionTiming = "end",
  } = params;

  assertNonNegative(principal, "principal");
  assertNonNegative(targetFutureValue, "targetFutureValue");
  assertFiniteNumber(rate, "rate");
  assertPositive(timesPerYear, "timesPerYear");
  assertNonNegative(contributionPerPeriod, "contributionPerPeriod");

  if (targetFutureValue <= principal) return 0;

  const r = rate / timesPerYear;
  if (r <= -1) {
    throw new RangeError("rate / timesPerYear must be > -1");
  }

  if (contributionPerPeriod === 0) {
    if (principal === 0) return Number.POSITIVE_INFINITY;
    if (rate === 0) return targetFutureValue <= principal ? 0 : Number.POSITIVE_INFINITY;
    if (r < 0) return Number.POSITIVE_INFINITY;
    const n = Math.log(targetFutureValue / principal) / Math.log(1 + r);
    return Number.isFinite(n) && n >= 0 ? Math.ceil(n) : Number.POSITIVE_INFINITY;
  }

  if (rate === 0) {
    const needed = targetFutureValue - principal;
    if (needed <= 0) return 0;
    return Math.ceil(needed / contributionPerPeriod);
  }

  // With contributions: iterate until FV >= target
  let fv = principal;
  let periods = 0;
  const maxPeriods = 10000;
  while (fv < targetFutureValue && periods < maxPeriods) {
    if (contributionTiming === "begin") fv += contributionPerPeriod;
    fv = fv * (1 + r) + (contributionTiming === "end" ? contributionPerPeriod : 0);
    periods++;
  }
  return fv >= targetFutureValue ? periods : Number.POSITIVE_INFINITY;
}
