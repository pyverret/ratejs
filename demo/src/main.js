import "./styles.css";
import {
  amortizationSchedule,
  bisection,
  cagr,
  compound,
  effectiveAnnualRate,
  futureValue,
  fv,
  inflationAdjustedAmount,
  investmentGrowth,
  irr,
  loanPayment,
  newtonRaphson,
  nper,
  npv,
  payoffPeriodWithExtra,
  paymentFromPresentValue,
  pmt,
  presentValue,
  presentValueOfAnnuity,
  pv,
  rate,
  rateToReachGoal,
  realReturn,
  remainingBalance,
  roundToCurrency,
  ruleOf72,
  periodsToReachGoal,
} from "../../dist/index.js";

const cardsEl = document.getElementById("cards");
const allStates = {};

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function pct(value) {
  return `${(value * 100).toFixed(3)}%`;
}

function number(value) {
  return Number.isFinite(value) ? value.toFixed(6) : String(value);
}

function parseCsvNumbers(input) {
  return input
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => !Number.isNaN(value));
}

const calculators = [
  {
    id: "cagr",
    title: "CAGR - Compound Annual Growth Rate",
    description: "Annualized growth rate between start and end value.",
    fields: [
      { id: "startValue", label: "Start value", type: "number", step: "100", value: 10000 },
      { id: "endValue", label: "End value", type: "number", step: "100", value: 21500 },
      { id: "years", label: "Years", type: "number", step: "1", value: 7 },
    ],
    compute: (values) => {
      const result = cagr(values);
      return { cagr: pct(result) };
    },
  },
  {
    id: "compound",
    title: "Compound Interest",
    description: "Future amount from principal with nominal annual compounding.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "100", value: 10000 },
      { id: "rate", label: "Annual rate", type: "number", step: "0.001", value: 0.06 },
      { id: "timesPerYear", label: "Compounds / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 10 },
    ],
    compute: (values) => {
      const result = compound(values);
      return { "final amount": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "effectiveAnnualRate",
    title: "EAR - Effective Annual Rate",
    description: "Converts nominal annual rate + frequency to effective annual rate.",
    fields: [
      { id: "nominalRate", label: "Nominal annual rate", type: "number", step: "0.001", value: 0.06 },
      { id: "timesPerYear", label: "Compounds / year", type: "number", step: "1", value: 12 },
    ],
    compute: (values) => {
      const result = effectiveAnnualRate(values);
      return { "effective annual rate": pct(result) };
    },
  },
  {
    id: "futureValue",
    title: "Future Value (Nominal Compounding)",
    description: "Future value of a current amount with annual nominal rate.",
    fields: [
      { id: "presentValue", label: "Present value", type: "number", step: "100", value: 10000 },
      { id: "rate", label: "Annual rate", type: "number", step: "0.001", value: 0.06 },
      { id: "timesPerYear", label: "Compounds / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 10 },
    ],
    compute: (values) => {
      const result = futureValue(values);
      return { "future value": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "presentValueNominal",
    title: "Present Value (Nominal Compounding)",
    description: "Present value of a known future lump sum.",
    fields: [
      { id: "futureValue", label: "Future value", type: "number", step: "100", value: 17900 },
      { id: "rate", label: "Annual rate", type: "number", step: "0.001", value: 0.06 },
      { id: "timesPerYear", label: "Compounds / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 10 },
    ],
    compute: (values) => {
      const result = presentValue(values);
      return { "present value": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "investmentGrowth",
    title: "Investment Growth",
    description: "Growth with optional periodic contributions.",
    fields: [
      { id: "initial", label: "Initial", type: "number", step: "100", value: 10000 },
      { id: "contributionPerPeriod", label: "Contribution / period", type: "number", step: "10", value: 250 },
      { id: "rate", label: "Annual rate", type: "number", step: "0.001", value: 0.06 },
      { id: "timesPerYear", label: "Compounds / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 10 },
      { id: "contributionTiming", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = investmentGrowth(values);
      return {
        "future value": money(roundToCurrency({ value: result.futureValue })),
        "total contributions": money(roundToCurrency({ value: result.totalContributions })),
        "total interest": money(roundToCurrency({ value: result.totalInterest })),
      };
    },
  },
  {
    id: "periodsToReachGoal",
    title: "Periods To Reach Goal",
    description: "Periods needed to reach a future-value target.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "100", value: 10000 },
      { id: "targetFutureValue", label: "Target future value", type: "number", step: "100", value: 50000 },
      { id: "rate", label: "Annual rate", type: "number", step: "0.001", value: 0.06 },
      { id: "timesPerYear", label: "Compounds / year", type: "number", step: "1", value: 12 },
      { id: "contributionPerPeriod", label: "Contribution / period", type: "number", step: "10", value: 100 },
      { id: "contributionTiming", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = periodsToReachGoal(values);
      return { periods: number(result), years: Number.isFinite(result) ? (result / values.timesPerYear).toFixed(2) : "Infinity" };
    },
  },
  {
    id: "rateToReachGoal",
    title: "Rate To Reach Goal",
    description: "Required per-period rate to hit a target in fixed periods.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "100", value: 10000 },
      { id: "targetFutureValue", label: "Target future value", type: "number", step: "100", value: 50000 },
      { id: "periods", label: "Periods", type: "number", step: "1", value: 120 },
      { id: "contributionPerPeriod", label: "Contribution / period", type: "number", step: "10", value: 100 },
      { id: "contributionTiming", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = rateToReachGoal(values);
      return { "rate / period": pct(result), "annualized x12": pct(result * 12) };
    },
  },
  {
    id: "paymentFromPresentValue",
    title: "Payment From Present Value",
    description: "Periodic payment to amortize present value over periods.",
    fields: [
      { id: "presentValue", label: "Present value", type: "number", step: "100", value: 200000 },
      { id: "ratePerPeriod", label: "Rate / period", type: "number", step: "0.0001", value: 0.0048 },
      { id: "periods", label: "Periods", type: "number", step: "1", value: 360 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = paymentFromPresentValue(values);
      return { "payment / period": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "presentValueOfAnnuity",
    title: "Present Value Of Annuity",
    description: "Current value of equal periodic payments.",
    fields: [
      { id: "paymentPerPeriod", label: "Payment / period", type: "number", step: "10", value: 500 },
      { id: "ratePerPeriod", label: "Rate / period", type: "number", step: "0.0001", value: 0.0048 },
      { id: "periods", label: "Periods", type: "number", step: "1", value: 360 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = presentValueOfAnnuity(values);
      return { "present value": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "realReturn",
    title: "Real Return",
    description: "Inflation-adjusted return from nominal return and inflation.",
    fields: [
      { id: "nominalReturn", label: "Nominal return", type: "number", step: "0.001", value: 0.08 },
      { id: "inflationRate", label: "Inflation rate", type: "number", step: "0.001", value: 0.03 },
    ],
    compute: (values) => {
      const result = realReturn(values);
      return { "real return": pct(result) };
    },
  },
  {
    id: "inflationAdjustedAmount",
    title: "Inflation Adjusted Amount",
    description: "Convert purchasing power between present and past/future.",
    fields: [
      { id: "amount", label: "Amount", type: "number", step: "10", value: 1000 },
      { id: "annualInflationRate", label: "Inflation rate", type: "number", step: "0.001", value: 0.03 },
      { id: "years", label: "Years", type: "number", step: "1", value: 10 },
      { id: "direction", label: "Direction", type: "select", options: ["toPast", "toFuture"], value: "toFuture" },
    ],
    compute: (values) => {
      const result = inflationAdjustedAmount(values);
      return { amount: money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "ruleOf72",
    title: "Rule Of 72",
    description: "Approximate years to double at a given annual rate.",
    fields: [
      { id: "rate", label: "Annual rate", type: "number", step: "0.001", value: 0.07 },
      { id: "constant", label: "Constant", type: "select", options: ["72", "69"], value: "72" },
    ],
    compute: (values) => {
      const result = ruleOf72({ rate: values.rate, constant: Number(values.constant) });
      return { "years to double": result.toFixed(2) };
    },
  },
  {
    id: "pmt",
    title: "PMT - Payment Per Period",
    description: "Periodic payment from rate, term, and present value.",
    fields: [
      { id: "ratePerPeriod", label: "Rate / period", type: "number", step: "0.0001", value: 0.0048 },
      { id: "periods", label: "Periods", type: "number", step: "1", value: 360 },
      { id: "presentValue", label: "Present value", type: "number", step: "100", value: 420000 },
      { id: "futureValue", label: "Future value", type: "number", step: "100", value: 0 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    presets: [
      {
        label: "Mortgage",
        values: { ratePerPeriod: 0.0048, periods: 360, presentValue: 420000, futureValue: 0, timing: "end" },
      },
      {
        label: "Car Loan",
        values: { ratePerPeriod: 0.0065, periods: 72, presentValue: 45000, futureValue: 0, timing: "end" },
      },
    ],
    compute: (values) => {
      const payment = pmt(values);
      return { "payment / period": money(roundToCurrency({ value: payment })) };
    },
  },
  {
    id: "fv",
    title: "FV - Future Value (TVM)",
    description: "Future value from payment stream + present value.",
    fields: [
      { id: "ratePerPeriod", label: "Rate / period", type: "number", step: "0.0001", value: 0.0048 },
      { id: "periods", label: "Periods", type: "number", step: "1", value: 360 },
      { id: "payment", label: "Payment", type: "number", step: "10", value: -2452.92 },
      { id: "presentValue", label: "Present value", type: "number", step: "100", value: 420000 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = fv(values);
      return { "future value": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "pv",
    title: "PV - Present Value",
    description: "Present value needed today for future + periodic cash flow targets.",
    fields: [
      { id: "ratePerPeriod", label: "Rate / period", type: "number", step: "0.0001", value: 0.0058 },
      { id: "periods", label: "Periods", type: "number", step: "1", value: 240 },
      { id: "payment", label: "Payment", type: "number", step: "10", value: -500 },
      { id: "futureValue", label: "Future value", type: "number", step: "1000", value: 500000 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    presets: [
      {
        label: "Retirement",
        values: { ratePerPeriod: 0.0058, periods: 240, payment: -500, futureValue: 500000, timing: "end" },
      },
      {
        label: "College Fund",
        values: { ratePerPeriod: 0.0045, periods: 180, payment: -300, futureValue: 150000, timing: "end" },
      },
    ],
    compute: (values) => {
      const result = pv(values);
      return { "present value": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "nper",
    title: "NPER - Number of Periods",
    description: "How many periods to reach the payoff goal.",
    fields: [
      { id: "ratePerPeriod", label: "Rate / period", type: "number", step: "0.0001", value: 0.0048 },
      { id: "payment", label: "Payment", type: "number", step: "10", value: -2452.92 },
      { id: "presentValue", label: "Present value", type: "number", step: "100", value: 420000 },
      { id: "futureValue", label: "Future value", type: "number", step: "100", value: 0 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
    ],
    compute: (values) => {
      const result = nper(values);
      return { periods: number(result), years: (result / 12).toFixed(2) };
    },
  },
  {
    id: "rate",
    title: "RATE - Rate Per Period",
    description: "Implied periodic rate from cash-flow assumptions.",
    fields: [
      { id: "periods", label: "Periods", type: "number", step: "1", value: 360 },
      { id: "payment", label: "Payment", type: "number", step: "10", value: -2452.92 },
      { id: "presentValue", label: "Present value", type: "number", step: "100", value: 420000 },
      { id: "futureValue", label: "Future value", type: "number", step: "100", value: 0 },
      { id: "timing", label: "Timing", type: "select", options: ["end", "begin"], value: "end" },
      { id: "guess", label: "Guess", type: "number", step: "0.0001", value: 0.005 },
      { id: "lowerBound", label: "Lower bound", type: "number", step: "0.0001", value: -0.99 },
      { id: "upperBound", label: "Upper bound", type: "number", step: "0.01", value: 10 },
    ],
    compute: (values) => {
      const solved = rate(values);
      return { "rate / period": pct(solved), "annualized x12": pct(solved * 12) };
    },
  },
  {
    id: "npv",
    title: "NPV - Net Present Value",
    description: "Discounted value of a cash-flow stream.",
    fields: [
      { id: "rate", label: "Discount rate", type: "number", step: "0.001", value: 0.09 },
      {
        id: "cashFlows",
        label: "Cash flows (CSV)",
        type: "text",
        value: "-250000,60000,70000,80000,90000",
      },
    ],
    presets: [
      { label: "Project A", values: { rate: 0.09, cashFlows: "-250000,60000,70000,80000,90000" } },
      { label: "Project B", values: { rate: 0.12, cashFlows: "-120000,28000,30000,36000,40000,42000" } },
    ],
    compute: (values) => {
      const result = npv({
        rate: values.rate,
        cashFlows: parseCsvNumbers(values.cashFlows),
      });
      return { "net present value": money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "irr",
    title: "IRR - Internal Rate of Return",
    description: "Internal rate of return for a cash-flow stream.",
    fields: [
      {
        id: "cashFlows",
        label: "Cash flows (CSV)",
        type: "text",
        value: "-250000,60000,70000,80000,90000",
      },
      { id: "guess", label: "Guess", type: "number", step: "0.001", value: 0.1 },
      { id: "maxIterations", label: "Max iterations", type: "number", step: "1", value: 100 },
      { id: "lowerBound", label: "Lower bound", type: "number", step: "0.001", value: -0.99 },
      { id: "upperBound", label: "Upper bound", type: "number", step: "0.01", value: 10 },
    ],
    presets: [
      {
        label: "Project A",
        values: { cashFlows: "-250000,60000,70000,80000,90000", guess: 0.1, maxIterations: 100, lowerBound: -0.99, upperBound: 10 },
      },
      {
        label: "Project B",
        values: { cashFlows: "-120000,28000,30000,36000,40000,42000", guess: 0.1, maxIterations: 120, lowerBound: -0.99, upperBound: 10 },
      },
    ],
    compute: (values) => {
      const solved = irr({
        cashFlows: parseCsvNumbers(values.cashFlows),
        guess: values.guess,
        maxIterations: values.maxIterations,
        lowerBound: values.lowerBound,
        upperBound: values.upperBound,
      });
      return { IRR: pct(solved) };
    },
  },
  {
    id: "loanPayment",
    title: "Loan Payment",
    description: "Amortizing loan payment by annual rate and term.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "1000", value: 420000 },
      { id: "annualRate", label: "Annual rate", type: "number", step: "0.001", value: 0.0575 },
      { id: "paymentsPerYear", label: "Payments / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 30 },
    ],
    presets: [
      {
        label: "30y Mortgage",
        values: { principal: 420000, annualRate: 0.0575, paymentsPerYear: 12, years: 30 },
      },
      {
        label: "15y Mortgage",
        values: { principal: 420000, annualRate: 0.0525, paymentsPerYear: 12, years: 15 },
      },
    ],
    compute: (values) => {
      const payment = loanPayment(values);
      return { "payment / period": money(roundToCurrency({ value: payment })) };
    },
  },
  {
    id: "amortization",
    title: "Amortization Snapshot",
    description: "Totals and payoff length with extra payment.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "1000", value: 420000 },
      { id: "annualRate", label: "Annual rate", type: "number", step: "0.001", value: 0.0575 },
      { id: "paymentsPerYear", label: "Payments / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 30 },
      { id: "extraPaymentPerPeriod", label: "Extra / period", type: "number", step: "10", value: 200 },
    ],
    presets: [
      {
        label: "No Extra",
        values: { principal: 420000, annualRate: 0.0575, paymentsPerYear: 12, years: 30, extraPaymentPerPeriod: 0 },
      },
      {
        label: "Extra $200",
        values: { principal: 420000, annualRate: 0.0575, paymentsPerYear: 12, years: 30, extraPaymentPerPeriod: 200 },
      },
    ],
    compute: (values) => {
      const schedule = amortizationSchedule(values);
      return {
        "base payment": money(roundToCurrency({ value: schedule.paymentPerPeriod })),
        "total interest": money(roundToCurrency({ value: schedule.totalInterest })),
        "total paid": money(roundToCurrency({ value: schedule.totalPaid })),
        periods: String(schedule.schedule.length),
      };
    },
  },
  {
    id: "remainingBalance",
    title: "Remaining Balance",
    description: "Balance left after a given payment number.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "1000", value: 420000 },
      { id: "annualRate", label: "Annual rate", type: "number", step: "0.001", value: 0.0575 },
      { id: "paymentsPerYear", label: "Payments / year", type: "number", step: "1", value: 12 },
      { id: "years", label: "Years", type: "number", step: "1", value: 30 },
      { id: "afterPeriodNumber", label: "After period #", type: "number", step: "1", value: 60 },
    ],
    compute: (values) => {
      const result = remainingBalance(values);
      return { balance: money(roundToCurrency({ value: result })) };
    },
  },
  {
    id: "payoffPeriodWithExtra",
    title: "Payoff Period With Extra",
    description: "Periods to payoff when adding extra amount each period.",
    fields: [
      { id: "principal", label: "Principal", type: "number", step: "1000", value: 420000 },
      { id: "annualRate", label: "Annual rate", type: "number", step: "0.001", value: 0.0575 },
      { id: "paymentsPerYear", label: "Payments / year", type: "number", step: "1", value: 12 },
      { id: "basePaymentPerPeriod", label: "Base payment", type: "number", step: "10", value: 2452.92 },
      { id: "extraPaymentPerPeriod", label: "Extra payment", type: "number", step: "10", value: 200 },
    ],
    compute: (values) => {
      const result = payoffPeriodWithExtra(values);
      return { periods: number(result), years: Number.isFinite(result) ? (result / values.paymentsPerYear).toFixed(2) : "Infinity" };
    },
  },
  {
    id: "roundToCurrency",
    title: "Round To Currency",
    description: "Currency rounding with half-up or half-even mode.",
    fields: [
      { id: "value", label: "Value", type: "number", step: "0.0001", value: 2.125 },
      { id: "decimals", label: "Decimals", type: "number", step: "1", value: 2 },
      { id: "mode", label: "Mode", type: "select", options: ["half-up", "half-even"], value: "half-up" },
    ],
    compute: (values) => {
      const result = roundToCurrency(values);
      return { rounded: String(result) };
    },
  },
  {
    id: "solvers",
    title: "Solvers - Newton/Bisection",
    description: "Low-level numeric solver utilities (root of x^3 - x - 2).",
    fields: [
      { id: "initialGuess", label: "Newton initial guess", type: "number", step: "0.1", value: 1.5 },
      { id: "lower", label: "Bisection lower", type: "number", step: "0.1", value: 1 },
      { id: "upper", label: "Bisection upper", type: "number", step: "0.1", value: 2 },
    ],
    compute: (values) => {
      const fn = (x) => x ** 3 - x - 2;
      const derivative = (x) => 3 * x ** 2 - 1;
      const newton = newtonRaphson({ initialGuess: values.initialGuess, fn, derivative });
      const bisected = bisection({ fn, lower: values.lower, upper: values.upper });
      return {
        "newton root": newton === undefined ? "undefined" : number(newton),
        "bisection root": bisected === undefined ? "undefined" : number(bisected),
      };
    },
  },
];

const groups = [
  {
    id: "growthReturns",
    title: "Growth & Returns",
    description: "Growth rates, valuation over time, and project return metrics.",
    calculators: [
      "cagr",
      "compound",
      "effectiveAnnualRate",
      "futureValue",
      "presentValueNominal",
      "investmentGrowth",
      "irr",
      "npv",
      "realReturn",
      "inflationAdjustedAmount",
      "ruleOf72",
    ],
  },
  {
    id: "tvm",
    title: "TVM Cash-Flow Solvers",
    description: "Solve for payment, value, periods, and rate using periodic cash-flow inputs.",
    calculators: ["pmt", "pv", "fv", "nper", "rate", "paymentFromPresentValue", "presentValueOfAnnuity"],
  },
  {
    id: "goalsPlanning",
    title: "Goals & Planning",
    description: "Target-based planning helpers for periods and required rates.",
    calculators: ["periodsToReachGoal", "rateToReachGoal"],
  },
  {
    id: "loans",
    title: "Loans",
    description: "Loan payment, balance, payoff speed, and amortization snapshots.",
    calculators: ["loanPayment", "amortization", "remainingBalance", "payoffPeriodWithExtra"],
  },
  {
    id: "utils",
    title: "Utilities",
    description: "Formatting and low-level numeric root-finding utilities.",
    calculators: ["roundToCurrency", "solvers"],
  },
];

function defaultValuesFor(calculator) {
  const defaults = {};
  calculator.fields.forEach((field) => {
    defaults[field.id] = field.value;
  });
  return defaults;
}

function paramName(calculatorId, fieldId) {
  return `c_${calculatorId}_${fieldId}`;
}

function parseFieldValue(field, valueFromUrl) {
  if (field.type === "text" || field.type === "select") return valueFromUrl;
  const parsed = Number(valueFromUrl);
  return Number.isFinite(parsed) ? parsed : field.value;
}

function applyUrlState(calculator, values) {
  const params = new URLSearchParams(window.location.search);
  calculator.fields.forEach((field) => {
    const key = paramName(calculator.id, field.id);
    const valueFromUrl = params.get(key);
    if (valueFromUrl !== null) {
      values[field.id] = parseFieldValue(field, valueFromUrl);
    }
  });
}

function syncUrlState() {
  const params = new URLSearchParams();
  calculators.forEach((calculator) => {
    const state = allStates[calculator.id];
    const defaults = defaultValuesFor(calculator);
    calculator.fields.forEach((field) => {
      const value = state[field.id];
      if (String(value) !== String(defaults[field.id])) {
        params.set(paramName(calculator.id, field.id), String(value));
      }
    });
  });
  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", nextUrl);
}

function createField(calculator, field, values, rerender) {
  const wrapper = document.createElement("label");
  wrapper.className = "input";

  const label = document.createElement("span");
  label.textContent = field.label;
  wrapper.appendChild(label);

  let input;
  if (field.type === "select") {
    input = document.createElement("select");
    field.options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option;
      item.textContent = option;
      input.appendChild(item);
    });
    input.value = String(field.value);
  } else {
    input = document.createElement("input");
    input.type = field.type;
    input.value = String(field.value);
    if (field.step) input.step = field.step;
  }
  input.dataset.fieldId = field.id;
  input.dataset.calcId = calculator.id;
  input.name = `${calculator.id}.${field.id}`;

  input.addEventListener("input", () => {
    if (field.type === "text" || field.type === "select") {
      values[field.id] = input.value;
    } else {
      values[field.id] = Number(input.value);
    }
    syncUrlState();
    rerender();
  });

  wrapper.appendChild(input);
  wrapper.dataset.field = field.id;
  return wrapper;
}

const calculatorMap = new Map(calculators.map((c) => [c.id, c]));

function renderCalculatorCard(calculator, idx, container) {
  const article = document.createElement("article");
  article.className = "card";
  article.style.animationDelay = `${idx * 60}ms`;
  article.dataset.calcId = calculator.id;

  const h2 = document.createElement("h2");
  h2.textContent = calculator.title;
  article.appendChild(h2);

  const desc = document.createElement("p");
  desc.className = "card-subtitle";
  desc.textContent = calculator.description;
  article.appendChild(desc);

  const form = document.createElement("div");
  form.className = "form-grid";
  article.appendChild(form);

  const controls = document.createElement("div");
  controls.className = "controls";
  article.appendChild(controls);

  const resetButton = document.createElement("button");
  resetButton.className = "btn";
  resetButton.type = "button";
  resetButton.textContent = "Reset";
  controls.appendChild(resetButton);

  if (calculator.presets && calculator.presets.length > 0) {
    calculator.presets.forEach((preset) => {
      const button = document.createElement("button");
      button.className = "btn";
      button.type = "button";
      button.textContent = preset.label;
      controls.appendChild(button);
      button.addEventListener("click", () => {
        Object.assign(values, preset.values);
        calculator.fields.forEach((field) => {
          const input = form.querySelector(`[data-field='${field.id}'] input, [data-field='${field.id}'] select`);
          if (input) input.value = String(values[field.id]);
        });
        syncUrlState();
        rerender();
      });
    });
  }

  const output = document.createElement("div");
  output.className = "results";
  article.appendChild(output);

  const values = defaultValuesFor(calculator);
  applyUrlState(calculator, values);
  allStates[calculator.id] = values;

  const rerender = () => {
    output.innerHTML = "";
    try {
      const computed = calculator.compute(values);
      Object.entries(computed).forEach(([label, value]) => {
        const row = document.createElement("div");
        row.className = "kv";
        row.dataset.resultKey = label;
        row.innerHTML = `<span>${label}</span><b>${value}</b>`;
        output.appendChild(row);
      });
    } catch (error) {
      const row = document.createElement("div");
      row.className = "error";
      row.textContent = error instanceof Error ? error.message : String(error);
      output.appendChild(row);
    }
  };

  resetButton.addEventListener("click", () => {
    const defaults = defaultValuesFor(calculator);
    Object.assign(values, defaults);
    calculator.fields.forEach((field) => {
      const input = form.querySelector(`[data-field='${field.id}'] input, [data-field='${field.id}'] select`);
      if (input) input.value = String(values[field.id]);
    });
    syncUrlState();
    rerender();
  });

  calculator.fields.forEach((field) => {
    form.appendChild(createField(calculator, field, values, rerender));
  });

  rerender();
  container.appendChild(article);
}

let cardIndex = 0;
groups.forEach((group) => {
  const section = document.createElement("section");
  section.className = "group";
  section.dataset.groupId = group.id;
  section.dataset.collapsed = "false";

  const header = document.createElement("div");
  header.className = "group-header";
  header.innerHTML = `<div><h2>${group.title}</h2><p>${group.description}</p></div>`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "group-toggle";
  toggle.textContent = "Collapse";
  toggle.setAttribute("aria-expanded", "true");
  header.appendChild(toggle);

  section.appendChild(header);

  const groupGrid = document.createElement("div");
  groupGrid.className = "group-grid";
  section.appendChild(groupGrid);

  toggle.addEventListener("click", () => {
    const collapsed = section.dataset.collapsed === "true";
    const nextCollapsed = !collapsed;
    section.dataset.collapsed = nextCollapsed ? "true" : "false";
    groupGrid.classList.toggle("is-collapsed", nextCollapsed);
    toggle.textContent = nextCollapsed ? "Expand" : "Collapse";
    toggle.setAttribute("aria-expanded", nextCollapsed ? "false" : "true");
  });

  group.calculators.forEach((calculatorId) => {
    const calculator = calculatorMap.get(calculatorId);
    if (!calculator) return;
    renderCalculatorCard(calculator, cardIndex, groupGrid);
    cardIndex++;
  });

  cardsEl?.appendChild(section);
});

syncUrlState();
