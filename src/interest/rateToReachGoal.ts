import { assertNonNegative, assertPositive } from "../utils/assertions.js";

export type RateToReachGoalParams = {
  principal: number;
  targetFutureValue: number;
  periods: number;
  contributionPerPeriod?: number;
  contributionTiming?: "end" | "begin";
};

/**
 * Rate per period required to reach target future value in given periods.
 * Uses Newton-Raphson when contributions are present; closed form for lump sum.
 */
export function rateToReachGoal(params: RateToReachGoalParams): number {
  const {
    principal,
    targetFutureValue,
    periods,
    contributionPerPeriod = 0,
    contributionTiming = "end",
  } = params;

  assertNonNegative(principal, "principal");
  assertNonNegative(targetFutureValue, "targetFutureValue");
  assertPositive(periods, "periods");
  assertNonNegative(contributionPerPeriod, "contributionPerPeriod");

  if (periods === 0) return 0;
  if (targetFutureValue <= principal && contributionPerPeriod === 0) return 0;

  if (contributionPerPeriod === 0) {
    if (targetFutureValue <= principal) return 0;
    return (targetFutureValue / principal) ** (1 / periods) - 1;
  }

  // FV = principal*(1+r)^n + PMT * ((1+r)^n - 1)/r (ordinary) or PMT * (1+r) * ((1+r)^n - 1)/r (due)
  // Solve for r with Newton-Raphson
  const dueFactor = contributionTiming === "begin" ? 1 : 0;
  let r = (targetFutureValue / (principal + contributionPerPeriod * periods)) ** (1 / periods) - 1;
  if (r <= -1) r = 0.01;

  for (let i = 0; i < 100; i++) {
    const onePlusR = 1 + r;
    const onePlusRN = onePlusR ** periods;
    const fvLump = principal * onePlusRN;
    const annuity = contributionPerPeriod * ((onePlusRN - 1) / (r || 1e-14)) * (1 + dueFactor * r);
    const fv = fvLump + annuity;
    const err = fv - targetFutureValue;
    if (Math.abs(err) < 1e-10) return r;
    // Derivative approximation
    const dr = r * 1e-6 || 1e-10;
    const r2 = r + dr;
    const onePlusR2 = 1 + r2;
    const onePlusR2N = onePlusR2 ** periods;
    const fv2 =
      principal * onePlusR2N +
      contributionPerPeriod * ((onePlusR2N - 1) / r2) * (1 + dueFactor * r2);
    const dFvDr = (fv2 - fv) / dr;
    r = r - err / dFvDr;
    if (r <= -1) r = 0.01;
    if (r > 10) r = 10;
  }
  return r;
}
