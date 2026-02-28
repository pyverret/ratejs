# @pyverret/ratejs

Lightweight, dependency-free TypeScript financial math library providing pure calculation utilities.

## Install

```bash
npm i @pyverret/ratejs
```

## Usage

All functions take a single options object (no positional args). Rates are decimals (e.g. `0.05` = 5%).

### Interest & growth

- **`compound`** - Final amount for a lump sum with compound interest.

```ts
compound({ principal: 1000, rate: 0.05, timesPerYear: 12, years: 10 });
```

- **`futureValue`** - Future value of a present lump sum.

```ts
futureValue({ presentValue: 2500, rate: 0.07, timesPerYear: 4, years: 3 });
```

- **`presentValue`** - Present value of a future lump sum.

```ts
presentValue({ futureValue: 5000, rate: 0.06, timesPerYear: 12, years: 5 });
```

- **`investmentGrowth`** - Future value with optional periodic contributions. Returns `{ futureValue, totalContributions, totalInterest }`.

```ts
investmentGrowth({
  initial: 1000,
  contributionPerPeriod: 100,
  rate: 0.06,
  timesPerYear: 12,
  years: 2,
  contributionTiming: "end", // or "begin"
});
```

- **`effectiveAnnualRate`** - Convert nominal rate + compounding frequency to effective annual rate (EAR).

```ts
effectiveAnnualRate({ nominalRate: 0.06, timesPerYear: 12 });
```

- **`periodsToReachGoal`** — Number of compounding periods until future value reaches a target (lump sum or with contributions).

```ts
periodsToReachGoal({
  principal: 1000,
  targetFutureValue: 2000,
  rate: 0.06,
  timesPerYear: 12,
  contributionPerPeriod: 0, // optional
  contributionTiming: "end",
});
```

Edge cases:
- Returns `Infinity` when the goal is unreachable.
- Throws `RangeError` when `rate / timesPerYear <= -1`.

- **`rateToReachGoal`** - Rate per period required to reach a target future value in a given number of periods.

```ts
rateToReachGoal({
  principal: 1000,
  targetFutureValue: 1500,
  periods: 24,
  contributionPerPeriod: 0,
  contributionTiming: "end",
});
```

- **`ruleOf72`** - Approximate years to double a lump sum at a given annual rate. Optional `constant: 69` for rule of 69.

```ts
ruleOf72({ rate: 0.07 }); // ~10.3 years
ruleOf72({ rate: 0.07, constant: 69 });
```

### Returns

- **`cagr`** - Compound annual growth rate between a start and end value over years.

```ts
cagr({ startValue: 1000, endValue: 2000, years: 10 });
```

- **`irr`** - Internal rate of return: discount rate that makes NPV of cash flows zero. `cashFlows[0]` is typically the initial outlay (negative).

```ts
irr({ cashFlows: [-1000, 300, 400, 500], guess: 0.1, maxIterations: 100 });
```

### Inflation

- **`realReturn`** - Real (inflation-adjusted) return from nominal return and inflation rate.

```ts
realReturn({ nominalReturn: 0.07, inflationRate: 0.02 });
```

- **`inflationAdjustedAmount`** - Purchasing power across time. `toPast`: value years ago with same purchasing power; `toFuture`: nominal amount in the future with same purchasing power.

```ts
inflationAdjustedAmount({
  amount: 100,
  annualInflationRate: 0.03,
  years: 10,
  direction: "toPast",
});
inflationAdjustedAmount({
  amount: 100,
  annualInflationRate: 0.03,
  years: 10,
  direction: "toFuture",
});
```

### Annuities

- **`presentValueOfAnnuity`** - Present value of a series of equal payments. `timing`: `"end"` (ordinary) or `"begin"` (annuity due).

```ts
presentValueOfAnnuity({
  paymentPerPeriod: 100,
  ratePerPeriod: 0.01,
  periods: 36,
  timing: "end",
});
```

- **`paymentFromPresentValue`** - Periodic payment to pay off a present value (e.g. loan) over a number of periods.

```ts
paymentFromPresentValue({
  presentValue: 100000,
  ratePerPeriod: 0.005,
  periods: 360,
  timing: "end",
});
```

### Loans

- **`loanPayment`** - Fixed periodic payment for an amortizing loan (nominal annual rate, payments per year, years).

```ts
loanPayment({
  principal: 200000,
  annualRate: 0.06,
  paymentsPerYear: 12,
  years: 30,
});
```

- **`amortizationSchedule`** - Full schedule: `{ paymentPerPeriod, schedule, totalPaid, totalInterest }`. Optional `extraPaymentPerPeriod`.

```ts
amortizationSchedule({
  principal: 200000,
  annualRate: 0.06,
  paymentsPerYear: 12,
  years: 30,
  extraPaymentPerPeriod: 50,
});
```

- **`remainingBalance`** - Balance remaining after a given number of payments (1-based `afterPeriodNumber`).

```ts
remainingBalance({
  principal: 200000,
  annualRate: 0.06,
  paymentsPerYear: 12,
  years: 30,
  afterPeriodNumber: 12,
});
```

- **`payoffPeriodWithExtra`** — Number of periods until the loan is paid off with base payment + extra payment.

```ts
payoffPeriodWithExtra({
  principal: 100000,
  annualRate: 0.06,
  paymentsPerYear: 12,
  basePaymentPerPeriod: 599.55,
  extraPaymentPerPeriod: 100,
});
```

Edge cases:
- Returns `Infinity` when payment is zero or does not cover per-period interest.

### Utils

- **`roundToCurrency`** - Round to decimal places (default 2). `mode`: `"half-up"` or `"half-even"` (banker's rounding).

```ts
roundToCurrency({ value: 2.125 }); // 2.13
roundToCurrency({ value: 2.125, decimals: 2, mode: "half-even" });
```

## Design

- Pure functions only
- No runtime dependencies
- Object-parameter inputs (no positional args)
- Deterministic outputs
- Tree-shakeable (import only what you use)
