export type NewtonRaphsonParams = {
  initialGuess: number;
  fn: (x: number) => number;
  derivative: (x: number) => number;
  tolerance?: number;
  maxIterations?: number;
  min?: number;
  max?: number;
};

export function newtonRaphson(params: NewtonRaphsonParams): number | undefined {
  const {
    initialGuess,
    fn,
    derivative,
    tolerance = 1e-10,
    maxIterations = 100,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
  } = params;

  let x = initialGuess;
  for (let i = 0; i < maxIterations; i++) {
    const value = fn(x);
    if (!Number.isFinite(value)) return undefined;
    if (Math.abs(value) <= tolerance) return x;

    const slope = derivative(x);
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-14) return undefined;

    x -= value / slope;
    if (x < min) x = min;
    if (x > max) x = max;
  }

  return undefined;
}

export type BisectionParams = {
  fn: (x: number) => number;
  lower: number;
  upper: number;
  tolerance?: number;
  maxIterations?: number;
};

export function bisection(params: BisectionParams): number | undefined {
  const { fn, lower, upper, tolerance = 1e-10, maxIterations = 200 } = params;
  let a = lower;
  let b = upper;
  let fa = fn(a);
  let fb = fn(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return undefined;
  if (Math.abs(fa) <= tolerance) return a;
  if (Math.abs(fb) <= tolerance) return b;

  for (let i = 0; i < maxIterations; i++) {
    const c = (a + b) / 2;
    const fc = fn(c);
    if (!Number.isFinite(fc)) return undefined;
    if (Math.abs(fc) <= tolerance || Math.abs(b - a) <= tolerance) return c;

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  return (a + b) / 2;
}
