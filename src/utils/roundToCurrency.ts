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
    const rounded = Math.round(scaled);
    const remainder = Math.abs(scaled - rounded);
    if (remainder === 0.5) {
      const down = Math.floor(scaled);
      return (down % 2 === 0 ? down : down + 1) / factor;
    }
    return rounded / factor;
  }
  return Math.round(value * factor) / factor;
}
