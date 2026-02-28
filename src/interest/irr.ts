import { assertFiniteNumber } from "../utils/assertions.js";

export type IrrParams = {
  cashFlows: number[];
  guess?: number;
  maxIterations?: number;
};

function npv(rate: number, cashFlows: number[]): number {
  let sum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (cf !== undefined) sum += cf / (1 + rate) ** t;
  }
  return sum;
}

function npvDerivative(rate: number, cashFlows: number[]): number {
  let sum = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (cf !== undefined) sum -= (t * cf) / (1 + rate) ** (t + 1);
  }
  return sum;
}

export function irr(params: IrrParams): number {
  const { cashFlows, guess = 0.1, maxIterations = 100 } = params;
  if (cashFlows.length === 0) return NaN;
  for (const cf of cashFlows) assertFiniteNumber(cf, "cashFlows[]");
  let r = guess;
  for (let i = 0; i < maxIterations; i++) {
    const val = npv(r, cashFlows);
    if (Math.abs(val) < 1e-10) return r;
    const der = npvDerivative(r, cashFlows);
    if (!Number.isFinite(der) || Math.abs(der) < 1e-15) break;
    r = r - val / der;
    if (r < -0.99) r = -0.99;
    if (r > 10) r = 10;
  }
  return r;
}
