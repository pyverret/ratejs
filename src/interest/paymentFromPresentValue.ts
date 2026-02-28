import { assertNonNegative } from "../utils/assertions.js";

export type PaymentFromPresentValueParams = {
  presentValue: number;
  ratePerPeriod: number;
  periods: number;
  /** Payment at start of each period (annuity due). Default end (ordinary). */
  timing?: "end" | "begin";
};

/**
 * Periodic payment required to pay off a present value (e.g. loan) over periods.
 * PMT = PV * r / (1 - (1+r)^-n). For due: divide by (1+r).
 */
export function paymentFromPresentValue(params: PaymentFromPresentValueParams): number {
  const { presentValue, ratePerPeriod, periods, timing = "end" } = params;
  assertNonNegative(presentValue, "presentValue");
  assertNonNegative(periods, "periods");

  if (presentValue === 0 || periods === 0) return 0;
  if (ratePerPeriod === 0) {
    const pmt = presentValue / periods;
    return timing === "begin" ? pmt / (1 + ratePerPeriod) : pmt;
  }
  let pmt = (ratePerPeriod * presentValue) / (1 - (1 + ratePerPeriod) ** -periods);
  if (timing === "begin") pmt /= 1 + ratePerPeriod;
  return pmt;
}
