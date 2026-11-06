import { expect, test } from "@playwright/test";

test("public navigation and trust disclaimer are visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /safer way to raise a cyber concern/i }),
  ).toBeVisible();
  await expect(page.getByText(/not an official OAU channel/i)).toBeVisible();
  await page
    .getByRole("link", { name: /report an incident/i })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: /report what happened/i })).toBeVisible();
});

test("keyboard users can reach the main content and labeled report controls", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByRole("heading", { name: /report what happened/i })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await expect(page.getByLabel("Incident type")).toBeVisible();
  await expect(page.getByLabel("What happened?")).toBeVisible();
});

test("seeded report can be tracked privately", async ({ page }) => {
  await page.goto("/track");
  await page.getByLabel("Report reference").fill("CW-2026-DEMA247");
  await page.getByLabel("Private tracking key").fill("SAFE-DEMA-TRAC-K2X6");
  await page.getByRole("button", { name: /check report status/i }).click();
  await expect(page.getByRole("heading", { name: /fake bursary refund message/i })).toBeVisible();
  await expect(page.getByText("Investigating", { exact: true }).first()).toBeVisible();
});

test("analyst can sign in and reach the incident queue", async ({ page, isMobile }) => {
  await page.goto("/login");
  await page.getByLabel("Work email").fill("analyst@cyberwatch.local");
  await page.getByLabel("Password").fill("Analyst!2026");
  await page.getByRole("button", { name: /sign in securely/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  if (isMobile) await page.locator("summary").filter({ hasText: "Open workspace menu" }).click();
  await page
    .getByRole("navigation", { name: "Responder workspace" })
    .filter({ visible: true })
    .getByRole("link", { name: "Incidents" })
    .click();
  await expect(page.getByRole("heading", { name: "Incident queue" })).toBeVisible();
});
