import { expect, test, type Page } from "@playwright/test";

const unique = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

async function signUp(page: Page, email: string, next?: string) {
  await page.goto(next ? `/signup?next=${encodeURIComponent(next)}` : "/signup");
  await page.getByLabel("Name").fill("Test Student");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("practice123");
  await page.getByRole("button", { name: "Create account" }).click();
}

test.describe("accounts and enrollment", () => {
  test("dashboard requires login and returns there afterwards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  test("signup validates input on the server", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("A");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Name must be at least 2 characters.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
    // Submitted values are echoed back so the form isn't wiped.
    await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
  });

  test("sign up, enroll, see it on the dashboard, leave, log out, log back in", async ({ page }) => {
    const email = unique();

    // Start from a course page as a signed-out visitor.
    await page.goto("/courses/drumming-mastery");
    await page.getByRole("link", { name: "Create a free account" }).click();
    await expect(page).toHaveURL(/\/signup\?next=/);
    await page.getByLabel("Name").fill("Test Student");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("practice123");
    await page.getByRole("button", { name: "Create account" }).click();

    // Redirected back to the course, now signed in.
    await expect(page).toHaveURL(/\/courses\/drumming-mastery$/);
    await page.getByRole("button", { name: "Enroll now" }).click();
    await expect(page.getByText("You're enrolled in this course.")).toBeVisible();
    await expect(page.getByText(/\d+ students? enrolled/)).toBeVisible();

    await page.getByRole("link", { name: "Go to dashboard" }).click();
    await expect(page.getByRole("heading", { name: "Hi, Test" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Drumming Mastery" })).toBeVisible();

    await page.getByRole("button", { name: "Leave course" }).click();
    await expect(page.getByText("You haven't enrolled in a course yet.")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Log in" })).toBeVisible();

    // Wrong password, then the right one.
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password1");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();

    await page.getByLabel("Password").fill("practice123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("an email can only be registered once", async ({ page, context }) => {
    const email = unique();
    await signUp(page, email);
    await expect(page).toHaveURL(/\/dashboard$/);

    await context.clearCookies();
    await signUp(page, email);
    await expect(page.getByText("An account with this email already exists.")).toBeVisible();
  });

  test("signed-in users are sent from /login to the dashboard", async ({ page }) => {
    await signUp(page, unique());
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("open redirects are refused", async ({ page }) => {
    await signUp(page, unique(), "//evil.example.com");
    await expect(page).toHaveURL(/localhost:\d+\/dashboard$/);
  });
});

test("waitlist form validates, saves, and updates the counter", async ({ page }) => {
  await page.goto("/waitlist");
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Pick an instrument.")).toBeVisible();

  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("What do you want to learn?").selectOption("Piano");
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.getByText("You're on the list!")).toBeVisible();
  await expect(page.getByTestId("waitlist-count")).toContainText(/\d+ musicians? (is|are) already waiting/);
});
