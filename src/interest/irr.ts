import { assertFiniteNumber } from "../utils/assertions.js";
import { bisection, newtonRaphson } from "../utils/solvers.js";

export type IrrParams = {
  cashFlows: number[];
  guess?: number;
  maxIterations?: number;
  lowerBound?: number;
  upperBound?: number;
};

function npvAt(rate: number, cashFlows: number[]): number {
  let sum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (cf !== undefined) sum += cf / (1 + rate) ** t;
  }
  return sum;
}

function npvDerivativeAt(rate: number, cashFlows: number[]): number {
  let sum = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (cf !== undefined) sum -= (t * cf) / (1 + rate) ** (t + 1);
  }
  return sum;
}

function hasPositiveAndNegative(cashFlows: number[]): boolean {
  let hasPositive = false;
  let hasNegative = false;
  for (const cf of cashFlows) {
    if (cf > 0) hasPositive = true;
    if (cf < 0) hasNegative = true;
    if (hasPositive && hasNegative) return true;
  }
  return false;
}

function findBracket(
  fn: (x: number) => number,
  lowerBound: number,
  upperBound: number,
): { lower: number; upper: number } | undefined {
  const fLower = fn(lowerBound);
  const fUpper = fn(upperBound);
  if (!Number.isFinite(fLower) || !Number.isFinite(fUpper)) return undefined;
  if (fLower === 0) return { lower: lowerBound, upper: lowerBound };
  if (fUpper === 0) return { lower: upperBound, upper: upperBound };
  if (fLower * fUpper < 0) return { lower: lowerBound, upper: upperBound };

  let lower = lowerBound;
  let upper = upperBound;
  let fLo = fLower;
  let fHi = fUpper;
  for (let i = 0; i < 20; i++) {
    const nextLower = Math.max(-0.999999999, (lower - 1) / 2);
    const fNextLower = fn(nextLower);
    if (Number.isFinite(fNextLower) && fNextLower * fHi < 0) {
      return { lower: nextLower, upper };
    }
    if (Number.isFinite(fNextLower)) {
      lower = nextLower;
      fLo = fNextLower;
    }

    upper = upper * 2 + 1;
    fHi = fn(upper);
    if (!Number.isFinite(fHi)) continue;
    if (fLo * fHi < 0) return { lower, upper };
  }

  return undefined;
}

export function irr(params: IrrParams): number {
  const {
    cashFlows,
    guess = 0.1,
    maxIterations = 100,
    lowerBound = -0.99,
    upperBound = 10,
  } = params;
  if (cashFlows.length === 0) {
    throw new RangeError("cashFlows must contain at least one value");
  }
  assertFiniteNumber(guess, "guess");
  assertFiniteNumber(maxIterations, "maxIterations");
  assertFiniteNumber(lowerBound, "lowerBound");
  assertFiniteNumber(upperBound, "upperBound");
  if (maxIterations <= 0 || !Number.isInteger(maxIterations)) {
    throw new RangeError("maxIterations must be a positive integer");
  }
  if (lowerBound <= -1) {
    throw new RangeError("lowerBound must be > -1");
  }
  if (upperBound <= lowerBound) {
    throw new RangeError("upperBound must be greater than lowerBound");
  }

  for (const cf of cashFlows) assertFiniteNumber(cf, "cashFlows[]");
  if (!hasPositiveAndNegative(cashFlows)) {
    throw new RangeError("cashFlows must include at least one positive and one negative value");
  }

  const fn = (rate: number) => npvAt(rate, cashFlows);
  const derivative = (rate: number) => npvDerivativeAt(rate, cashFlows);

  const newton = newtonRaphson({
    initialGuess: guess,
    fn,
    derivative,
    tolerance: 1e-10,
    maxIterations,
    min: lowerBound,
    max: upperBound,
  });
  if (newton !== undefined) return newton;

  const bracket = findBracket(fn, lowerBound, upperBound);
  if (bracket === undefined) {
    throw new RangeError("IRR did not converge within search bounds");
  }
  if (bracket.lower === bracket.upper) return bracket.lower;

  const bisected = bisection({
    fn,
    lower: bracket.lower,
    upper: bracket.upper,
    tolerance: 1e-10,
    maxIterations: maxIterations * 2,
  });
  if (bisected !== undefined) return bisected;

  throw new RangeError("IRR did not converge");
}
