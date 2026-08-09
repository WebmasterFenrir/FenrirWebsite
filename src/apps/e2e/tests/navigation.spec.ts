import { test, expect, type Page } from "@playwright/test";

// The header nav has an aria-label; the footer social-links <nav> has a
// different one, so we can target the main navigation unambiguously.
const mainNav = (page: Page) =>
  page.getByRole("navigation", { name: "Hoofdnavigatie" });

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Use desktop viewport so the visible nav (not hamburger) is shown
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
  });

  test("nav is present on homepage", async ({ page }) => {
    await expect(mainNav(page)).toBeVisible();
  });

  test("nav is present on all pages", async ({ page }) => {
    for (const path of ["/over-ons", "/praesidium", "/sponsors"]) {
      await page.goto(path);
      await expect(mainNav(page), `nav missing on ${path}`).toBeVisible();
    }
  });

  test("clicking 'Over ons' navigates to /over-ons", async ({ page }) => {
    await mainNav(page).getByRole("link", { name: /over ons/i }).click();
    await expect(page).toHaveURL(/\/over-ons/);
  });

  test("clicking 'Praesidium' navigates to /praesidium", async ({ page }) => {
    await mainNav(page).getByRole("link", { name: /praesidium/i }).click();
    await expect(page).toHaveURL(/\/praesidium/);
  });

  test("clicking 'Sponsors' navigates to /sponsors", async ({ page }) => {
    await mainNav(page).getByRole("link", { name: /sponsors/i }).click();
    await expect(page).toHaveURL(/\/sponsors/);
  });

  test("clicking 'Home' navigates to /", async ({ page }) => {
    await page.goto("/over-ons");
    await mainNav(page).getByRole("link", { name: /home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Mobile navigation (hamburger)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
  });

  test("hamburger menu button is visible on mobile", async ({ page }) => {
    // On mobile the desktop links are hidden, so the only visible button in
    // the main nav is the hamburger trigger.
    await expect(mainNav(page).getByRole("button")).toBeVisible();
  });
});
