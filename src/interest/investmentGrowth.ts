import { assertNonNegative, assertPositive } from "../utils/assertions.js";

export type InvestmentGrowthParams = {
  initial: number;
  contributionPerPeriod?: number;
  rate: number;
  timesPerYear: number;
  years: number;
  contributionTiming?: "end" | "begin";
};

export type InvestmentGrowthResult = {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
};

/**
 * Future value of an investment with optional periodic contributions.
 *
 * - `rate` is nominal annual rate (e.g. 0.05 for 5%)
 * - contributions occur each compounding period (`timesPerYear`)
 */
export function investmentGrowth(params: InvestmentGrowthParams): InvestmentGrowthResult {
  const {
    initial,
    contributionPerPeriod = 0,
    rate,
    timesPerYear,
    years,
    contributionTiming = "end",
  } = params;

  assertNonNegative(initial, "initial");
  assertNonNegative(contributionPerPeriod, "contributionPerPeriod");
  assertPositive(timesPerYear, "timesPerYear");
  assertNonNegative(years, "years");

  const periods = Math.round(timesPerYear * years);
  if (periods === 0) {
    return {
      futureValue: initial,
      totalContributions: 0,
      totalInterest: 0,
    };
  }

  const r = rate / timesPerYear;

  // Lump sum growth
  const fvInitial = rate === 0 ? initial : initial * (1 + r) ** periods;

  // Annuity future value (ordinary vs due)
  let fvContrib = 0;
  if (contributionPerPeriod !== 0) {
    if (rate === 0) {
      fvContrib = contributionPerPeriod * periods;
    } else {
      const ordinary = contributionPerPeriod * (((1 + r) ** periods - 1) / r);
      fvContrib = contributionTiming === "begin" ? ordinary * (1 + r) : ordinary;
    }
  }

  const futureValue = fvInitial + fvContrib;
  const totalContributions = contributionPerPeriod * periods;
  const totalInterest = futureValue - initial - totalContributions;

  return { futureValue, totalContributions, totalInterest };
}
