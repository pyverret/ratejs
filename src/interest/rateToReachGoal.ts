import { assertNonNegative, assertPositive } from "../utils/assertions.js";
import { bisection, newtonRaphson } from "../utils/solvers.js";

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

  const dueFactor = contributionTiming === "begin" ? 1 : 0;
  const fn = (r: number) => {
    const onePlusR = 1 + r;
    const onePlusRN = onePlusR ** periods;
    const fvLump = principal * onePlusRN;
    const annuityBase = r === 0 ? periods : (onePlusRN - 1) / r;
    const fvAnnuity = contributionPerPeriod * annuityBase * (1 + dueFactor * r);
    return fvLump + fvAnnuity - targetFutureValue;
  };
  const derivative = (r: number) => {
    const delta = Math.abs(r) > 1e-6 ? Math.abs(r) * 1e-6 : 1e-6;
    return (fn(r + delta) - fn(r - delta)) / (2 * delta);
  };

  const initialGuess =
    (targetFutureValue / (principal + contributionPerPeriod * periods)) ** (1 / periods) - 1;

  const newton = newtonRaphson({
    initialGuess: Number.isFinite(initialGuess) ? Math.max(initialGuess, -0.99) : 0.01,
    fn,
    derivative,
    tolerance: 1e-10,
    maxIterations: 100,
    min: -0.99,
    max: 10,
  });
  if (newton !== undefined) return newton;

  const bisected = bisection({
    fn,
    lower: -0.99,
    upper: 10,
    tolerance: 1e-10,
    maxIterations: 200,
  });
  return bisected ?? Number.NaN;
}
