import { test, expect } from "@playwright/test";

test.describe("Homepage content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows 'Word lid!' call-to-action", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /word lid/i })
    ).toBeVisible();
  });

  test("shows welcome section", async ({ page }) => {
    await expect(page.locator("#welcomesection")).toBeVisible();
    await expect(page.getByText("Bij Fenrir zit je goed!")).toBeVisible();
  });

  test("shows praesidium section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Huidig Praesidium", exact: true })
    ).toBeVisible();
  });

  test("shows sponsors section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Onze Sponsors", exact: true })
    ).toBeVisible();
  });
});

test.describe("Over ons page content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/over-ons");
  });

  test("shows history section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Onze Geschiedenis", exact: true })
    ).toBeVisible();
  });

  test("shows Fenrir Antwerpen section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Fenrir Antwerpen", exact: true })
    ).toBeVisible();
  });

  test("shows Fenrir Brugge section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Fenrir Brugge", exact: true })
    ).toBeVisible();
  });

  test("shows name explanation section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "De naam Fenrir", exact: true })
    ).toBeVisible();
  });

  test("shows club song section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Ons Clublied", exact: true })
    ).toBeVisible();
  });
});

test.describe("Praesidium page content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/praesidium");
  });

  test("shows 'Wat Doet Het Praesidium' section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Wat Doet Het Praesidium", exact: true })
    ).toBeVisible();
  });

  test("shows role descriptions", async ({ page }) => {
    await expect(
      page.getByText(/Praeses & Vice-Praeses/)
    ).toBeVisible();
  });

  test("shows 'Praesidium Per Jaar' section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Praesidium Per Jaar", exact: true })
    ).toBeVisible();
  });
});

test.describe("Sponsors page content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sponsors");
  });

  test("shows partners section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Partners Van Fenrir", exact: true })
    ).toBeVisible();
  });

  test("shows 'Waarom Fenrir Sponsoren?' section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Waarom Fenrir Sponsoren?", exact: true })
    ).toBeVisible();
  });

  test("shows 'Sponsor Worden?' section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Sponsor Worden?", exact: true })
    ).toBeVisible();
  });

  test("shows contact button", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /neem contact op/i })
    ).toBeVisible();
  });

  test("contact link points to pr@fenrirclub.be", async ({ page }) => {
    const link = page.getByRole("link", { name: /neem contact op/i });
    await expect(link).toHaveAttribute("href", "mailto:pr@fenrirclub.be");
  });
});
