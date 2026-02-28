# ratejs — Financial Math Library

## Goal

ratejs is a lightweight, dependency-free TypeScript financial math library providing pure calculation utilities.

Inspired by date-fns philosophy:

* small
* tree-shakeable
* deterministic
* readable formulas

## Principles

* Pure functions only
* No external dependencies
* TypeScript-first
* Developer-friendly APIs
* Object parameter inputs

## V1 Features

* compound interest
* future value
* present value
* investment growth
* loan payment
* amortization schedule

## API Style

GOOD:
compound({
principal: 1000,
rate: 0.05,
timesPerYear: 12,
years: 10
})

BAD:
compound(1000, 0.05, 12, 10)

## Folder Structure

src/
interest/
loans/
utils/

tests/

## Output Goals

* Tree shakeable
* ESM + CJS support
* 0 dependencies
* Fully tested
