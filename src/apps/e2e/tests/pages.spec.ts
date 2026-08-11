import { test, expect } from "@playwright/test";

test.describe("Pages load correctly", () => {
  test("homepage has correct title and heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fenrir Antwerpen/);
    await expect(
      page.getByRole("heading", { name: "Fenrir Antwerpen", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("De vriendelijkste club van Antwerpen!")
    ).toBeVisible();
  });

  test("over-ons page has correct title and heading", async ({ page }) => {
    await page.goto("/over-ons");
    await expect(page).toHaveTitle(/Over ons/);
    await expect(
      page.getByRole("heading", { name: "Over Ons", level: 1 })
    ).toBeVisible();
  });

  test("praesidium page has correct title and heading", async ({ page }) => {
    await page.goto("/praesidium");
    await expect(page).toHaveTitle(/Praesidium/);
    await expect(
      page.getByRole("heading", { name: "Het Praesidium", level: 1 })
    ).toBeVisible();
  });

  test("sponsors page has correct title and heading", async ({ page }) => {
    await page.goto("/sponsors");
    await expect(page).toHaveTitle(/Sponsors/);
    await expect(
      page.getByRole("heading", { name: "Onze Sponsors", level: 1 })
    ).toBeVisible();
  });

  test("activiteiten page has correct title and heading", async ({ page }) => {
    await page.goto("/activiteiten");
    await expect(page).toHaveTitle(/Activiteiten/);
    await expect(
      page.getByRole("heading", { name: "Activiteiten", level: 1 })
    ).toBeVisible();
  });

  test("all pages return 200", async ({ page }) => {
    for (const path of ["/", "/over-ons", "/praesidium", "/sponsors", "/activiteiten"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should return 200`).toBe(200);
    }
  });
});
