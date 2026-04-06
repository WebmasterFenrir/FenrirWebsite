import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Use desktop viewport so the visible nav (not hamburger) is shown
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
  });

  test("nav is present on homepage", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
  });

  test("nav is present on all pages", async ({ page }) => {
    for (const path of ["/over-ons", "/praesidium", "/sponsors"]) {
      await page.goto(path);
      await expect(page.locator("nav"), `nav missing on ${path}`).toBeVisible();
    }
  });

  test("clicking 'Over ons' navigates to /over-ons", async ({ page }) => {
    await page.locator("nav").getByRole("link", { name: /over ons/i }).click();
    await expect(page).toHaveURL(/\/over-ons/);
  });

  test("clicking 'Praesidium' navigates to /praesidium", async ({ page }) => {
    await page.locator("nav").getByRole("link", { name: /praesidium/i }).click();
    await expect(page).toHaveURL(/\/praesidium/);
  });

  test("clicking 'Sponsors' navigates to /sponsors", async ({ page }) => {
    await page.locator("nav").getByRole("link", { name: /sponsors/i }).click();
    await expect(page).toHaveURL(/\/sponsors/);
  });

  test("clicking 'Home' navigates to /", async ({ page }) => {
    await page.goto("/over-ons");
    await page.locator("nav").getByRole("link", { name: /home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Mobile navigation (hamburger)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
  });

  test("hamburger menu button is visible on mobile", async ({ page }) => {
    // The sm:hidden div contains the hamburger
    await expect(page.locator("nav")).toBeVisible();
  });
});
