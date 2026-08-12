import { test, expect } from "@playwright/test";

// Manual contexts don't inherit baseURL from the config, so use absolute URLs.
const BASE = "http://localhost:4321";

test.describe("Language detection", () => {
  test("redirects English browsers from / to /en", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();

    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByText("The friendliest club in Antwerp!")).toBeVisible();

    await context.close();
  });

  test("keeps Dutch browsers on /", async ({ browser }) => {
    const context = await browser.newContext({ locale: "nl-NL" });
    const page = await context.newPage();

    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("De vriendelijkste club van Antwerpen!")).toBeVisible();

    await context.close();
  });

  test("keeps an unsupported-language browser on Dutch /", async ({ browser }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();

    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("De vriendelijkste club van Antwerpen!")).toBeVisible();

    await context.close();
  });

  test("the saved cookie overrides the browser preference", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();

    // First visit: en-US browser → redirected to /en, cookie set to en.
    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/en\/?$/);

    // Click NL in the language switcher → back to Dutch, cookie flips to nl.
    await page.getByRole("link", { name: "NL" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("De vriendelijkste club van Antwerpen!")).toBeVisible();

    // Reload with the en-US browser again: the cookie now wins.
    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("De vriendelijkste club van Antwerpen!")).toBeVisible();

    await context.close();
  });

  test("an explicit /en URL always serves English, even with a Dutch cookie", async ({ browser }) => {
    const context = await browser.newContext({ locale: "nl-NL" });
    const page = await context.newPage();

    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/$/);

    // Save a Dutch cookie explicitly (as if the visitor chose NL before).
    await context.addCookies([
      { name: "fenrir_lang", value: "nl", domain: "localhost", path: "/" },
    ]);

    await page.goto(`${BASE}/en`);
    await expect(page.getByText("The friendliest club in Antwerp!")).toBeVisible();

    await context.close();
  });
});
