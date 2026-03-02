import { assertFiniteNumber } from "./assertions.js";

export type RoundToCurrencyParams = {
  value: number;
  /** Decimal places. Default 2. */
  decimals?: number;
  /** 'half-up': 0.5 rounds up. 'half-even': banker's rounding. Default 'half-up'. */
  mode?: "half-up" | "half-even";
};

/**
 * Rounds a number to currency (default 2 decimals). half-up: 2.125 -> 2.13. half-even: 2.125 -> 2.12.
 */
export function roundToCurrency(params: RoundToCurrencyParams): number {
  const { value, decimals = 2, mode = "half-up" } = params;
  assertFiniteNumber(value, "value");
  const d = Math.max(0, Math.floor(decimals));
  const factor = 10 ** d;
  if (mode === "half-even") {
    const scaled = value * factor;
    const sign = scaled < 0 ? -1 : 1;
    const absScaled = Math.abs(scaled);
    const floorAbs = Math.floor(absScaled);
    const fraction = absScaled - floorAbs;
    const epsilon = 1e-12;
    if (Math.abs(fraction - 0.5) <= epsilon) {
      const nearestEven = floorAbs % 2 === 0 ? floorAbs : floorAbs + 1;
      return (sign * nearestEven) / factor;
    }
    return Math.round(scaled) / factor;
  }
  return Math.round(value * factor) / factor;
}
