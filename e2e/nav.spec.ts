import { test, expect } from "@playwright/test";
import { mockNetwork } from "./helpers";

test("the skip link is the first thing Tab reaches and it moves focus into the page", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("content");
});

test("the skip link stays off screen until it is focused", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/about/");
  await expect(page.getByRole("link", { name: "Skip to content" })).not.toBeInViewport();
});

const ROUTES: [string, string][] = [
  ["/projects/", "Projects"],
  ["/oss/", "Open source"],
  ["/stats/", "Stats"],
  ["/writing/", "Writing"],
  ["/about/", "About"],
];
for (const [route, label] of ROUTES) {
  test(`nav marks ${label} as the current page on ${route}`, async ({ page }) => {
    await mockNetwork(page);
    await page.goto(route);
    const current = page.locator("nav a[aria-current=page]:visible");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(label);
  });
}

test("the home page marks no nav link as current", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/");
  await expect(page.locator("nav a[aria-current=page]")).toHaveCount(0);
});

test("a project page keeps Projects lit", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/projects/");
  await page.locator('main a[href^="/projects/"][href$="/"]:not([href="/projects/"])').first().click();
  await expect(page).toHaveURL(/\/projects\/.+\//);
  await expect(page.locator("nav a[aria-current=page]:visible")).toHaveText("Projects");
});

test("every main page has exactly one h1", async ({ page }) => {
  await mockNetwork(page);
  for (const route of ["/", "/projects/", "/oss/", "/stats/", "/writing/", "/about/"]) {
    await page.goto(route);
    await expect(page.locator("h1"), route).toHaveCount(1);
  }
});

test("360 px: the mobile menu opens and marks the current page", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await mockNetwork(page);
  await page.goto("/stats/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#mobile-menu a[aria-current=page]")).toHaveText("Stats");
});
