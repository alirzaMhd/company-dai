import { test, expect } from "@playwright/test";

const TEST_EMAIL = "kayoh67437@inreur.com";
const TEST_PASSWORD = "kayoh67437";

test.describe("Login flow", () => {
  test("should login and redirect based on company status", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.locator("h1")).toContainText("Sign in to Paperclip");

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    await page.click('button[type="submit"]');

    await page.waitForURL((url) => {
      const path = url.pathname;
      return path === "/dashboard" || path === "/onboarding" || path.startsWith("/dashboard") || path.startsWith("/onboarding");
    }, { timeout: 10000 });

    const currentUrl = page.url();
    const pathname = new URL(currentUrl).pathname;

    if (pathname === "/onboarding") {
      console.log("User has no company, redirected to onboarding");
      await expect(page.locator("body")).toContainText("Create your company");
    } else if (pathname.startsWith("/dashboard") || pathname.includes("dashboard")) {
      console.log("User has company, redirected to dashboard");
      await expect(page.locator("body")).toBeVisible();
    } else {
      throw new Error(`Unexpected redirect after login: ${currentUrl}`);
    }
  });

  test("should correctly identify user company status and navigate accordingly", async ({ page }) => {
    await page.goto("/auth");

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForLoadState("networkidle");

    const finalUrl = page.url();
    const url = new URL(finalUrl);

    const hasCompany = !url.pathname.includes("onboarding") && 
                       (url.pathname.includes("dashboard") || url.pathname === "/" || url.pathname === "");

    console.log(`Final URL: ${finalUrl}`);
    console.log(`User has company: ${hasCompany}`);

    if (url.pathname === "/onboarding") {
      expect(url.pathname).toBe("/onboarding");
    } else if (hasCompany) {
      expect(url.pathname).toMatch(/^\/(pap\/)?dashboard/);
    } else {
      throw new Error(`Login flow did not redirect to expected path. Got: ${url.pathname}`);
    }
  });
});