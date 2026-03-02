import { assertFiniteNumber, assertNonNegative, assertPositive } from "../utils/assertions.js";
import { bisection, newtonRaphson } from "../utils/solvers.js";

export type RateToReachGoalParams = {
  principal: number;
  targetFutureValue: number;
  periods: number;
  contributionPerPeriod?: number;
  contributionTiming?: "end" | "begin";
  lowerBound?: number;
  upperBound?: number;
  maxIterations?: number;
  tolerance?: number;
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
    lowerBound = -0.99,
    upperBound = 10,
    maxIterations = 100,
    tolerance = 1e-10,
  } = params;

  assertNonNegative(principal, "principal");
  assertNonNegative(targetFutureValue, "targetFutureValue");
  assertPositive(periods, "periods");
  assertNonNegative(contributionPerPeriod, "contributionPerPeriod");
  assertFiniteNumber(lowerBound, "lowerBound");
  assertFiniteNumber(upperBound, "upperBound");
  assertFiniteNumber(maxIterations, "maxIterations");
  assertFiniteNumber(tolerance, "tolerance");
  if (lowerBound <= -1) throw new RangeError("lowerBound must be > -1");
  if (upperBound <= lowerBound) throw new RangeError("upperBound must be greater than lowerBound");
  if (!Number.isInteger(maxIterations) || maxIterations <= 0) {
    throw new RangeError("maxIterations must be a positive integer");
  }
  if (tolerance <= 0) throw new RangeError("tolerance must be > 0");

  if (periods === 0) return 0;
  if (targetFutureValue <= principal && contributionPerPeriod === 0) return 0;

  if (contributionPerPeriod === 0) {
    if (targetFutureValue <= principal) return 0;
    if (principal === 0) {
      throw new RangeError(
        "rateToReachGoal is undefined when principal is 0 and contributions are 0",
      );
    }
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
    initialGuess: Number.isFinite(initialGuess) ? Math.max(initialGuess, lowerBound) : 0.01,
    fn,
    derivative,
    tolerance,
    maxIterations,
    min: lowerBound,
    max: upperBound,
  });
  if (newton !== undefined) return newton;

  const bracket = findBracket(fn, lowerBound, upperBound);
  if (bracket === undefined) {
    throw new RangeError("rateToReachGoal did not converge within search bounds");
  }
  if (bracket.lower === bracket.upper) return bracket.lower;

  const bisected = bisection({
    fn,
    lower: bracket.lower,
    upper: bracket.upper,
    tolerance,
    maxIterations: maxIterations * 2,
  });
  if (bisected !== undefined) return bisected;
  throw new RangeError("rateToReachGoal did not converge");
}

function findBracket(
  fn: (x: number) => number,
  lowerBound: number,
  upperBound: number,
): { lower: number; upper: number } | undefined {
  const scan = (
    start: number,
    end: number,
    segments = 200,
  ): { lower: number; upper: number } | undefined => {
    let prevX: number | undefined;
    let prevValue: number | undefined;
    for (let i = 0; i <= segments; i++) {
      const x = start + ((end - start) * i) / segments;
      const value = fn(x);
      if (!Number.isFinite(value)) continue;
      if (value === 0) return { lower: x, upper: x };
      if (prevX !== undefined && prevValue !== undefined && prevValue * value < 0) {
        return { lower: prevX, upper: x };
      }
      prevX = x;
      prevValue = value;
    }
    return undefined;
  };

  let lower = lowerBound;
  let upper = upperBound;
  for (let i = 0; i < 20; i++) {
    const bracket = scan(lower, upper);
    if (bracket !== undefined) return bracket;
    lower = Math.max(-0.999999999, (lower - 1) / 2);
    upper = upper * 2 + 1;
  }

  return scan(lower, upper, 400);
}
