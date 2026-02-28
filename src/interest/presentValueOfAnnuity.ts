import { assertNonNegative } from "../utils/assertions.js";

export type PresentValueOfAnnuityParams = {
  paymentPerPeriod: number;
  ratePerPeriod: number;
  periods: number;
  timing?: "end" | "begin";
};

/**
 * Present value of an annuity. PV = PMT * (1 - (1+r)^-n) / r. Due: multiply by (1+r).
 */
export function presentValueOfAnnuity(params: PresentValueOfAnnuityParams): number {
  const { paymentPerPeriod, ratePerPeriod, periods, timing = "end" } = params;
  assertNonNegative(paymentPerPeriod, "paymentPerPeriod");
  assertNonNegative(periods, "periods");

  if (periods === 0) return 0;
  if (ratePerPeriod === 0) {
    const pv = paymentPerPeriod * periods;
    return timing === "begin" ? pv * (1 + ratePerPeriod) : pv;
  }
  const pv = (paymentPerPeriod * (1 - (1 + ratePerPeriod) ** -periods)) / ratePerPeriod;
  return timing === "begin" ? pv * (1 + ratePerPeriod) : pv;
}
