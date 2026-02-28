import { assertNonNegative, assertPositive } from "../utils/assertions.js";
import { loanPayment } from "./loanPayment.js";

export type AmortizationScheduleParams = {
  principal: number;
  annualRate: number;
  paymentsPerYear: number;
  years: number;
  extraPaymentPerPeriod?: number;
};

export type AmortizationRow = {
  period: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
};

export type AmortizationScheduleResult = {
  paymentPerPeriod: number;
  schedule: AmortizationRow[];
  totalPaid: number;
  totalInterest: number;
};

export function amortizationSchedule(
  params: AmortizationScheduleParams,
): AmortizationScheduleResult {
  const { principal, annualRate, paymentsPerYear, years, extraPaymentPerPeriod = 0 } = params;
  assertNonNegative(principal, "principal");
  assertPositive(paymentsPerYear, "paymentsPerYear");
  assertNonNegative(years, "years");
  assertNonNegative(extraPaymentPerPeriod, "extraPaymentPerPeriod");

  const scheduledN = Math.round(paymentsPerYear * years);
  if (scheduledN === 0 || principal === 0) {
    return { paymentPerPeriod: 0, schedule: [], totalPaid: 0, totalInterest: 0 };
  }

  const basePayment = loanPayment({ principal, annualRate, paymentsPerYear, years });
  const r = annualRate / paymentsPerYear;

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalPaid = 0;
  let totalInterest = 0;

  for (let period = 1; period <= scheduledN && balance > 0; period++) {
    const interestPayment = r === 0 ? 0 : balance * r;
    let payment = basePayment + extraPaymentPerPeriod;
    let principalPayment = payment - interestPayment;

    if (principalPayment > balance) {
      principalPayment = balance;
      payment = principalPayment + interestPayment;
    }

    balance = balance - principalPayment;
    if (Math.abs(balance) < 1e-12) balance = 0;

    totalPaid += payment;
    totalInterest += interestPayment;

    schedule.push({
      period,
      payment,
      principalPayment,
      interestPayment,
      balance,
    });
  }

  return {
    paymentPerPeriod: basePayment,
    schedule,
    totalPaid,
    totalInterest,
  };
}
