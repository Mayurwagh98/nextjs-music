import { expect, test } from "@playwright/test";

test.describe("browsing the catalog", () => {
  test("home page renders featured courses and live sessions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Master your music" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learn with the best" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming live sessions" })).toBeVisible();
    await expect(page).toHaveTitle(/Cadence Music Academy/);
  });

  test("filters courses through the URL", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByText("10 courses")).toBeVisible();

    await page.getByLabel("Instrument").selectOption("Guitar");
    await expect(page).toHaveURL(/instrument=Guitar/);
    await expect(page.getByText("2 courses match your filters")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Blues Guitar Techniques" })).toBeVisible();

    await page.getByRole("link", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.getByText("10 courses")).toBeVisible();
  });

  test("search with no results shows an empty state", async ({ page }) => {
    await page.goto("/courses?q=bagpipes");
    await expect(page.getByText("No courses match those filters.")).toBeVisible();
  });

  test("clicking a course opens the intercepted modal, refresh shows the full page", async ({ page }) => {
    await page.goto("/courses");
    await page.getByRole("link", { name: "Guitar Fundamentals", exact: true }).click();

    const dialog = page.getByRole("dialog", { name: "Guitar Fundamentals" });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/courses\/guitar-fundamentals$/);
    // The list is still underneath the modal.
    await expect(page.getByRole("heading", { name: "Find your next course" })).toBeAttached();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/courses$/);

    await page.goto("/courses/guitar-fundamentals");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Guitar Fundamentals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();
  });

  test("unknown course shows the not-found page", async ({ page, request }) => {
    await page.goto("/courses/does-not-exist");
    await expect(page.getByText("This track skipped.")).toBeVisible();
    // The very first hit on an unknown param can be served from the ISR
    // App Shell (200) while it renders; once rendered it is a real 404.
    await expect.poll(async () => (await request.get("/courses/does-not-exist")).status()).toBe(404);
  });

  test("the audio player keeps playing across navigations", async ({ page }) => {
    await page.goto("/courses/jazz-improvisation");
    await page.getByRole("button", { name: "Play preview of Jazz Improvisation" }).click();

    const player = page.getByRole("region", { name: "Audio player" });
    await expect(player).toBeVisible();
    await expect(player.getByRole("link", { name: "Jazz Improvisation" })).toBeVisible();

    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(player).toBeVisible();
    // The same <audio> element is still playing after the route change.
    await expect
      .poll(() => page.evaluate(() => (document.querySelector("audio")?.currentTime ?? 0) > 0))
      .toBe(true);
  });

  test("public JSON API and SEO files", async ({ request }) => {
    const api = await request.get("/api/courses?instrument=piano");
    expect(api.ok()).toBe(true);
    const body = await api.json();
    expect(body.count).toBe(1);
    expect(body.courses[0].slug).toBe("piano-for-beginners");

    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/courses/blues-guitar-techniques");

    const og = await request.get("/courses/guitar-fundamentals/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
  });
});
