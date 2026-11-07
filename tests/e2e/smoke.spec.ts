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

test("a submitted report persists and exposes only the analyst's shared update", async ({
  page,
}, testInfo) => {
  const title = `Fictional ${testInfo.project.name} reporting flow`;
  await page.goto("/report");
  await page.getByLabel("Incident type").selectOption("PHISHING");
  await page.getByLabel("Where did it happen?").selectOption("EMAIL");
  await page.locator("#title").fill(title);
  await page
    .getByLabel("What happened?")
    .fill(
      "This is a fictional browser test. A suspicious message requested an account code; no information was entered.",
    );
  await page.locator("#impact").selectOption("LOW");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Submit report" }).click();
  const receipt = page.getByRole("region", { name: "Save your private tracking details" });
  await expect(receipt).toBeVisible();
  const text = await receipt.innerText();
  const reference = text.match(/CW-\d{4}-[A-HJ-NP-Z2-9]{7}/)?.[0];
  const key = text.match(/[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}/)?.[0];
  expect(reference).toBeTruthy();
  expect(key).toBeTruthy();

  await page.goto("/login");
  await page.getByLabel("Work email").fill("analyst@cyberwatch.local");
  await page.getByLabel("Password").fill("Analyst!2026");
  await page.getByRole("button", { name: /sign in securely/i }).click();
  await expect(page.getByRole("heading", { name: "Welcome back, Victor." })).toBeVisible();
  await page.goto(`/dashboard/incidents?query=${reference}`);
  await page.getByRole("link").filter({ hasText: title, visible: true }).first().click();
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await page.getByLabel("Status", { exact: true }).selectOption("TRIAGED");
  await page.getByLabel("Severity", { exact: true }).selectOption("HIGH");
  await page.getByLabel("Assignment").selectOption("SELF");
  await page.getByLabel("Update note").fill("Fictional internal investigation note.");
  await page.getByRole("button", { name: "Save incident update" }).click();
  await expect(page.getByRole("status")).toContainText("was updated successfully");
  await page.reload();
  await page
    .getByLabel("Update note")
    .fill("We have reviewed this fictional report. Do not reply to the sender.");
  await page.getByLabel(/Share this note with the reporter/).check();
  await page.getByRole("button", { name: "Save incident update" }).click();
  await expect(page.getByRole("status")).toContainText("was updated successfully");

  await page.goto("/track");
  await page.getByLabel("Report reference").fill(reference!);
  await page.getByLabel("Private tracking key").fill(key!);
  await page.getByRole("button", { name: /check report status/i }).click();
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByText("Triaged", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("We have reviewed this fictional report. Do not reply to the sender."),
  ).toBeVisible();
  await expect(page.getByText("Fictional internal investigation note.")).toHaveCount(0);
});
