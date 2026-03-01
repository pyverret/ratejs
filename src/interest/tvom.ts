import { assertFiniteNumber, assertPositive } from "../utils/assertions.js";
import { bisection, newtonRaphson } from "../utils/solvers.js";

type PaymentTiming = "end" | "begin";

function assertTiming(value: PaymentTiming, name: string): void {
  if (value !== "end" && value !== "begin") {
    throw new RangeError(`${name} must be "end" or "begin"`);
  }
}

function annuityDueFactor(ratePerPeriod: number, timing: PaymentTiming): number {
  return timing === "begin" ? 1 + ratePerPeriod : 1;
}

function futureValueFromCashFlows(
  ratePerPeriod: number,
  periods: number,
  payment: number,
  presentValue: number,
  timing: PaymentTiming,
): number {
  if (ratePerPeriod === 0) return -(presentValue + payment * periods);

  const growth = (1 + ratePerPeriod) ** periods;
  const paymentFv =
    payment * ((growth - 1) / ratePerPeriod) * annuityDueFactor(ratePerPeriod, timing);
  return -(presentValue * growth + paymentFv);
}

export type FvParams = {
  ratePerPeriod: number;
  periods: number;
  payment?: number;
  presentValue: number;
  timing?: PaymentTiming;
};

/**
 * Excel FV equivalent.
 */
export function fv(params: FvParams): number {
  const { ratePerPeriod, periods, payment = 0, presentValue, timing = "end" } = params;
  assertFiniteNumber(ratePerPeriod, "ratePerPeriod");
  assertPositive(periods, "periods");
  assertFiniteNumber(payment, "payment");
  assertFiniteNumber(presentValue, "presentValue");
  assertTiming(timing, "timing");

  return futureValueFromCashFlows(ratePerPeriod, periods, payment, presentValue, timing);
}

export type PvParams = {
  ratePerPeriod: number;
  periods: number;
  payment?: number;
  futureValue?: number;
  timing?: PaymentTiming;
};

/**
 * Excel PV equivalent.
 */
export function pv(params: PvParams): number {
  const { ratePerPeriod, periods, payment = 0, futureValue = 0, timing = "end" } = params;
  assertFiniteNumber(ratePerPeriod, "ratePerPeriod");
  assertPositive(periods, "periods");
  assertFiniteNumber(payment, "payment");
  assertFiniteNumber(futureValue, "futureValue");
  assertTiming(timing, "timing");

  if (ratePerPeriod === 0) return -(futureValue + payment * periods);

  const growth = (1 + ratePerPeriod) ** periods;
  const paymentPv =
    ((payment * (1 - 1 / growth)) / ratePerPeriod) * annuityDueFactor(ratePerPeriod, timing);
  return -futureValue / growth - paymentPv;
}

export type PmtParams = {
  ratePerPeriod: number;
  periods: number;
  presentValue: number;
  futureValue?: number;
  timing?: PaymentTiming;
};

/**
 * Excel PMT equivalent.
 */
export function pmt(params: PmtParams): number {
  const { ratePerPeriod, periods, presentValue, futureValue = 0, timing = "end" } = params;
  assertFiniteNumber(ratePerPeriod, "ratePerPeriod");
  assertPositive(periods, "periods");
  assertFiniteNumber(presentValue, "presentValue");
  assertFiniteNumber(futureValue, "futureValue");
  assertTiming(timing, "timing");

  if (ratePerPeriod === 0) return -(presentValue + futureValue) / periods;

  const growth = (1 + ratePerPeriod) ** periods;
  const numerator = -(futureValue + presentValue * growth) * ratePerPeriod;
  const denominator = (growth - 1) * annuityDueFactor(ratePerPeriod, timing);
  return numerator / denominator;
}

export type NperParams = {
  ratePerPeriod: number;
  payment: number;
  presentValue: number;
  futureValue?: number;
  timing?: PaymentTiming;
};

/**
 * Excel NPER equivalent.
 */
export function nper(params: NperParams): number {
  const { ratePerPeriod, payment, presentValue, futureValue = 0, timing = "end" } = params;
  assertFiniteNumber(ratePerPeriod, "ratePerPeriod");
  assertFiniteNumber(payment, "payment");
  assertFiniteNumber(presentValue, "presentValue");
  assertFiniteNumber(futureValue, "futureValue");
  assertTiming(timing, "timing");
  if (ratePerPeriodIsInvalidForDomain(ratePerPeriod)) {
    throw new RangeError("ratePerPeriod must be > -1");
  }

  if (ratePerPeriod === 0) {
    const linear = -(presentValue + futureValue) / payment;
    return Number.isFinite(linear) && linear >= 0 ? linear : Number.NaN;
  }

  const adjustedPayment = payment * annuityDueFactor(ratePerPeriod, timing);
  const numerator = adjustedPayment - futureValue * ratePerPeriod;
  const denominator = adjustedPayment + presentValue * ratePerPeriod;
  if (numerator === 0 || denominator === 0) return Number.NaN;
  const ratio = numerator / denominator;
  if (ratio <= 0) return Number.NaN;

  const periods = Math.log(ratio) / Math.log(1 + ratePerPeriod);
  return Number.isFinite(periods) ? periods : Number.NaN;
}

export type RateParams = {
  periods: number;
  payment: number;
  presentValue: number;
  futureValue?: number;
  timing?: PaymentTiming;
  guess?: number;
  tolerance?: number;
  maxIterations?: number;
  lowerBound?: number;
  upperBound?: number;
};

/**
 * Excel RATE equivalent.
 */
export function rate(params: RateParams): number {
  const {
    periods,
    payment,
    presentValue,
    futureValue = 0,
    timing = "end",
    guess = 0.1,
    tolerance = 1e-10,
    maxIterations = 100,
    lowerBound = -0.999999999,
    upperBound = 10,
  } = params;
  assertPositive(periods, "periods");
  assertFiniteNumber(payment, "payment");
  assertFiniteNumber(presentValue, "presentValue");
  assertFiniteNumber(futureValue, "futureValue");
  assertFiniteNumber(guess, "guess");
  assertFiniteNumber(maxIterations, "maxIterations");
  assertFiniteNumber(lowerBound, "lowerBound");
  assertFiniteNumber(upperBound, "upperBound");
  assertTiming(timing, "timing");
  if (ratePerPeriodIsInvalidForDomain(lowerBound)) {
    throw new RangeError("lowerBound must be > -1");
  }
  if (upperBound <= lowerBound) {
    throw new RangeError("upperBound must be greater than lowerBound");
  }
  if (!Number.isInteger(maxIterations) || maxIterations <= 0) {
    throw new RangeError("maxIterations must be a positive integer");
  }

  const fn = (r: number) =>
    futureValueFromCashFlows(r, periods, payment, presentValue, timing) - futureValue;
  const derivative = (r: number) => {
    const delta = Math.abs(r) > 1e-5 ? Math.abs(r) * 1e-6 : 1e-6;
    return (fn(r + delta) - fn(r - delta)) / (2 * delta);
  };

  const newton = newtonRaphson({
    initialGuess: guess,
    fn,
    derivative,
    tolerance,
    maxIterations,
    min: lowerBound,
    max: upperBound,
  });
  if (newton !== undefined) return newton;

  const bracket = findRateBracket(fn, lowerBound, upperBound);
  if (bracket === undefined) {
    throw new RangeError("RATE did not converge within search bounds");
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

  throw new RangeError("RATE did not converge");
}

function ratePerPeriodIsInvalidForDomain(ratePerPeriod: number): boolean {
  return ratePerPeriod <= -1;
}

function findRateBracket(
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
