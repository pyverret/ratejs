import { expect, test } from "@playwright/test";

test("demo calculators render and react to input", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Finance Formulas, Not Spreadsheets" })).toBeVisible();

  const pmtCard = page.locator("[data-calc-id='pmt']");
  const paymentValue = pmtCard.locator("[data-result-key='payment / period'] b");
  await expect(paymentValue).toBeVisible();
  const before = await paymentValue.textContent();

  await pmtCard.locator("[data-field-id='periods']").fill("180");
  const after = await paymentValue.textContent();
  expect(after).not.toBe(before);

  await pmtCard.getByRole("button", { name: "Reset" }).click();
  const resetValue = await paymentValue.textContent();
  expect(resetValue).toBe(before);
});