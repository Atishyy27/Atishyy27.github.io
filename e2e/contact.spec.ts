import { test, expect } from "@playwright/test";
import { person } from "../src/content/site";
import { mockNetwork } from "./helpers";

// The site is built with a test relay key (see ci.yml), so the form takes the
// Web3Forms path. Every request that leaves localhost is answered by the mocks.

async function sendOnAbout(page: import("@playwright/test").Page) {
  await page.goto("/about/#contact");
  await page.locator("input[name=name]").fill("Ada Test");
  await page.locator("textarea[name=message]").fill("hello from a test");
  await page.getByRole("button", { name: /Send message/ }).click();
}

test("home closing banner shows the address as text", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/");
  const addr = page.getByRole("link", { name: person.email });
  await addr.scrollIntoViewIfNeeded();
  await expect(addr).toBeVisible();
  await expect(addr).toHaveAttribute("href", `mailto:${person.email}`);
});

test("about: the address is on the page and Copy puts it on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockNetwork(page);
  await page.goto("/about/#contact");
  await expect(page.getByRole("link", { name: person.email })).toBeVisible();
  await page.getByRole("button", { name: "Copy" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(person.email);
});

test("form: relay answers, the visitor sees Sent", async ({ page }) => {
  await mockNetwork(page, "ok");
  await sendOnAbout(page);
  await expect(page.getByText("Sent")).toBeVisible();
});

test("form: relay slow but answering, shows Sending then Sent", async ({ page }) => {
  await mockNetwork(page, "slow");
  await sendOnAbout(page);
  await expect(page.getByRole("button", { name: /Sending/ })).toBeVisible();
  await expect(page.getByText("Sent")).toBeVisible({ timeout: 8000 });
});

test("form: relay returns 500, the visitor gets the address instead of a dead end", async ({ page }) => {
  await mockNetwork(page, "500");
  await sendOnAbout(page);
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("Something broke");
  await expect(alert).toContainText(person.email);
  await expect(page.getByRole("button", { name: /Send message/ })).toBeEnabled();
});

test("form: relay never answers, it gives up after 10 s and the button comes back", async ({ page }) => {
  test.setTimeout(40_000);
  await mockNetwork(page, "timeout");
  await sendOnAbout(page);
  await expect(page.getByRole("button", { name: /Sending/ })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("That took too long", { timeout: 15_000 });
  await expect(page.getByRole("button", { name: /Send message/ })).toBeEnabled();
});

test("360 px: the address and Copy fit on the screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await mockNetwork(page);
  await page.goto("/about/#contact");
  const addr = page.getByRole("link", { name: person.email });
  await addr.scrollIntoViewIfNeeded();
  for (const el of [addr, page.getByRole("button", { name: "Copy" })]) {
    const box = await el.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  }
});
