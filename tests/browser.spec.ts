import { test, expect, type Page } from "@playwright/test";
import { db, transaction } from "../src/lib/store";
import { seed } from "../src/lib/model";
const base = "http://127.0.0.1:3002";
const featurePaths = [
  "/onboarding",
  "/feed",
  "/discover",
  "/cart",
  "/loyalty",
  "/orders",
  "/notifications",
  "/settings",
  "/creators/mira",
  "/events/color-after-hours",
  "/studio",
  "/studio/setup",
  "/studio/profile",
  "/studio/publish",
  "/studio/insights",
  "/studio/orders",
  "/studio/loyalty",
  "/studio/community",
  "/studio/collaborate",
  "/studio/collaborate/new",
  "/studio/collaborate/launch-reel",
  "/studio/collaborations",
  "/studio/messages",
  "/studio/menu",
  "/admin",
];
async function action(
  page: Page,
  name: string,
  data: Record<string, unknown> = {},
) {
  const r = await page.request.post(base + "/api/app", {
    headers: { Origin: base },
    data: { action: name, data },
  });
  return { status: r.status(), body: await r.json() };
}
async function state(page: Page) {
  return (await page.request.get(base + "/api/app")).json();
}
async function login(page: Page, account: string) {
  await page.goto("/signin");
  await page
    .getByLabel("Sample account", { exact: true })
    .selectOption(account);
  await page
    .getByRole("button", { name: "Continue to demo", exact: true })
    .click();
  await expect(page).toHaveURL(account === "alex" ? /\/feed$/ : /\/studio$/);
}
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  if (!/^astra_browser_test_\d+$/.test(process.env.ASTRA_DB_NAME || ""))
    throw new Error("Unsafe test database");
  await transaction((s) => Object.assign(s, seed()));
  const pageErrors: string[] = [];
  errors.set(page, pageErrors);
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => {
    if (
      m.type() === "error" &&
      /hydration|Minified React error/i.test(m.text())
    )
      pageErrors.push(m.text());
  });
  // Test AStra, never contact a real provider or record real credentials.
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === base
      ? route.continue()
      : route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "External provider stub for local testing",
        }),
  );
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page), "No uncaught JS or hydration errors").toEqual([]);
});
test.afterAll(async () => {
  const { client } = await db();
  await client.close();
});

test("every feature rejects missing and forged sessions, including direct API access", async ({
  page,
  context,
}) => {
  for (const forged of [false, true]) {
    if (forged)
      await context.addCookies([
        { name: "astra-session", value: "forged", url: base },
      ]);
    for (const path of featurePaths) {
      const r = await page.request.get(base + path, { maxRedirects: 0 });
      expect(r.status(), path).toBe(307);
      expect(r.headers().location).toBe("/signin");
    }
    for (const path of [
      "/api/app",
      "/api/app?scope=creator",
      "/api/app?scope=admin",
      "/api/integrations/spotify",
      "/api/integrations/youtube",
    ]) {
      const r = await page.request.get(base + path);
      expect(r.status(), path).toBe(401);
      expect(Object.keys(await r.json())).toEqual(["error"]);
    }
    for (const provider of ["spotify", "youtube"]) {
      const r = await page.request.post(
        `${base}/api/integrations/${provider}`,
        {
          headers: { Origin: base },
          data: { action: "connect", role: "audience" },
        },
      );
      expect(r.status()).toBe(401);
    }
  }
});

for (const role of ["audience", "creator"] as const) {
  test(`AStra ${role} signs up, signs out and signs back in with password; providers stay optional`, async ({
    page,
  }) => {
    const email = `${role}-${Date.now()}@example.test`;
    await page.goto("/signin");
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await page
      .getByLabel("Your name", { exact: false })
      .fill("Private account tester");
    await page.getByLabel("Email", { exact: false }).fill(email);
    await page
      .getByLabel("Password", { exact: false })
      .fill("Private account passphrase!");
    await page.getByLabel("I’m here as", { exact: true }).selectOption(role);
    await page
      .getByRole("button", { name: "Create AStra account", exact: true })
      .click();
    await expect(page).toHaveURL(/\/onboarding$/);
    const s = await state(page);
    expect(s.me.authProvider).toBe("password");
    expect(s.me.balance).toBe(0);
    expect(s.me.roles).toEqual([role]);
    expect(JSON.stringify(s)).not.toMatch(/passwordHash|emailLoginHash/);
    await page.goto(role === "creator" ? "/studio" : "/feed");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const logout = await action(page, "logout");
    expect(logout.body.state).toBeNull();
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/signin$/);
    await page.getByLabel("Email", { exact: false }).fill(email.toUpperCase());
    await page
      .getByLabel("Password", { exact: false })
      .fill("Private account passphrase!");
    await page
      .getByRole("button", { name: "Sign in to AStra", exact: true })
      .click();
    await expect(page).toHaveURL(role === "creator" ? /\/studio$/ : /\/feed$/);
    await page.goto("/settings");
    await expect(
      page.getByRole("button", { name: "Connect Spotify", exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Connect YouTube", exact: true }),
    ).toBeEnabled();
  });
}

test("invalid password, duplicate signup, role escalation and cross-origin signup are rejected", async ({
  page,
}) => {
  const data = {
    name: "Security tester",
    email: `security-${Date.now()}@example.test`,
    password: "A secure test passphrase!",
    role: "audience",
  };
  expect(
    (await action(page, "signup", { ...data, password: "short" })).status,
  ).toBe(400);
  expect(
    (await action(page, "signup", { ...data, role: "admin" })).status,
  ).toBe(400);
  expect((await action(page, "signup", data)).status).toBe(200);
  expect((await action(page, "signup", data)).status).toBe(409);
  await action(page, "logout");
  const wrong = await action(page, "signin", {
    email: data.email,
    password: "Incorrect long passphrase!",
  });
  const unknown = await action(page, "signin", {
    email: "unknown@example.test",
    password: "Incorrect long passphrase!",
  });
  expect(wrong.status).toBe(401);
  expect(unknown.body).toEqual(wrong.body);
  expect((await page.request.get(base + "/api/app")).status()).toBe(401);
  const csrf = await page.request.post(base + "/api/app", {
    headers: { Origin: "https://untrusted.test" },
    data: { action: "signup", data },
  });
  expect(csrf.status()).toBe(403);
});

test("landing has one persistent sculpture, accessible hover and reduced motion", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("[data-sculpture]")).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText(/working prototype|sample data/i);
  for (const logo of await page.locator(".as-logo__mark img").all()) {
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "/media/mascot/astra-mascot-poster-1x1.jpg");
    expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/media/mascot/astra-mascot-poster-1x1.jpg");
  expect(await page.locator(".footer-cta").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(4, 6, 13, 0.18)");
  expect(await page.locator(".footer-cta").evaluate((e) => getComputedStyle(e).backdropFilter)).toBe("blur(2px)");
  expect(await page.locator(".feature-list").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(4, 6, 13, 0.18)");
  expect(await page.locator(".feature-list").evaluate((e) => getComputedStyle(e).backdropFilter)).toBe("blur(2px)");
  expect(await page.locator(".landing .steps").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(4, 6, 13, 0.18)");
  expect(await page.locator(".landing .steps").evaluate((e) => getComputedStyle(e).backdropFilter)).toBe("blur(2px)");
  await expect(page.locator(".cinema-stage video")).toHaveCount(0);
  await expect(
    page.locator(".landing-sculpture .particle-hero__poster"),
  ).toHaveCount(1);
  const surfaces = await page
    .locator(".cinema-stage")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  expect(surfaces.every((s) => s === "rgba(0, 0, 0, 0)")).toBe(true);
  await expect(page.locator(".landing-motion-control")).toHaveCount(0);
  const button = page.locator(".stage-copy .as-btn").first();
  await button.focus();
  expect(
    await button.evaluate((e) => getComputedStyle(e).outlineStyle),
  ).not.toBe("none");
  if (testInfo.project.name === "desktop") {
    await button.hover();
    expect(await button.evaluate((e) => getComputedStyle(e).filter)).toBe(
      "brightness(1.16)",
    );
    expect(await button.evaluate((e) => getComputedStyle(e).transform)).toBe(
      "none",
    );
  }
  await page.screenshot({
    path: testInfo.outputPath("landing.png"),
    fullPage: true,
  });
});

test("one sculpture flows across the entire page, responds to pointer and pauses without blocking links", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const sculpture = page.locator('[data-sculpture="journey"]');
  const originalCanvas = await sculpture.locator("canvas").elementHandle();
  let lastProgress = -1;
  for (const variant of ["hero", "collab", "loyalty"]) {
    const stage = page.locator(`.cinema-stage--${variant}`);
    await stage.scrollIntoViewIfNeeded();
    const pause = page.getByRole("button", {
      name: "Pause background animation",
    });
    await expect(pause).toBeVisible();
    await expect
      .poll(async () => Number(await sculpture.getAttribute("data-progress")))
      .toBeGreaterThan(lastProgress);
    if (variant !== "hero")
      await expect
        .poll(async () => Number(await sculpture.getAttribute("data-progress")))
        .toBeGreaterThan(lastProgress + 0.05);
    lastProgress = Number(await sculpture.getAttribute("data-progress"));
    expect(
      await originalCanvas!.evaluate(
        (c) => c === document.querySelector(".landing-sculpture canvas"),
      ),
    ).toBe(true);
    const viewport = page.viewportSize()!;
    await page.mouse.move(viewport.width * 0.76, viewport.height * 0.35);
    await expect
      .poll(async () => Number(await sculpture.getAttribute("data-pointer")))
      .toBeGreaterThan(0.5);
    const dimensions = await sculpture
      .locator("canvas")
      .evaluate((c: HTMLCanvasElement) => ({
        width: c.width,
        css: c.clientWidth,
      }));
    expect(dimensions.width).toBeGreaterThanOrEqual(dimensions.css);
    await pause.click();
    await expect(
      page.getByRole("button", { name: "Play background animation" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        (key) => sessionStorage.getItem(key),
        "astra-paused:particle-journey",
      ),
    ).toBe("1");
    await page.screenshot({
      path: testInfo.outputPath(`${variant}-sculpture.png`),
    });
    await page
      .getByRole("button", { name: "Play background animation" })
      .click();
    await expect(
      page.getByRole("button", { name: "Pause background animation" }),
    ).toBeVisible();
  }
  await page.locator(".public-footer").scrollIntoViewIfNeeded();
  await expect
    .poll(async () => Number(await sculpture.getAttribute("data-progress")))
    .toBeGreaterThan(0.9);
  await page
    .locator('.landing-motion-control[aria-label="Pause background animation"]')
    .click();
  const frozen = await sculpture.getAttribute("data-progress");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  expect(await sculpture.getAttribute("data-progress")).toBe(frozen);
  await page.reload();
  await expect(
    page.locator(
      '.landing-motion-control[aria-label="Play background animation"]',
    ),
  ).toBeVisible();
});

test("landing replaces placeholder artwork with an official album embed without extra captions or autoplay", async ({
  page,
}) => {
  await page.goto("/");
  const album = page.locator(".landing-album");
  await expect(album.locator("iframe")).toHaveAttribute(
    "src",
    "https://open.spotify.com/embed/album/5rMOCuiWWbEBcHaKM69Hmv?utm_source=generator&theme=0",
  );
  await expect(album.locator("iframe")).not.toHaveAttribute(
    "allow",
    /autoplay/,
  );
  await expect(album.locator("iframe")).toHaveAttribute(
    "title",
    "A Matter of Time by Laufey — official Spotify album preview",
  );
  await expect(album.locator("figcaption")).toHaveCount(0);
  await expect(album.locator("a")).toHaveCount(0);
  await expect(page.locator(".editorial-grid")).not.toContainText(
    "Placeholder art",
  );
});

test("WebGL unavailable falls back to vectors without blocking signup or navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.locator(".landing-sculpture .particle-hero__still"),
  ).toBeVisible();
  await expect(page.locator(".particle-hero--ready")).toHaveCount(0);
  await page
    .locator(".cinema-stage--hero")
    .getByRole("link", { name: "Join AStra" })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign in to AStra" }),
  ).toBeVisible();
});

test("creator ships an order; audience sees tracking and requests refund without wallet credit", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/orders");
  await page.getByRole("button", { name: "View details", exact: true }).click();
  await page.getByLabel("Sample tracking reference").fill("BROWSER-TRACK-001");
  await page.getByRole("button", { name: "Mark as shipped" }).click();
  await expect
    .poll(
      async () =>
        (await state(page)).orders.find(
          (o: { id: string }) => o.id === "AST-24809",
        ).status,
    )
    .toBe("Shipped");
  await login(page, "alex");
  await page.goto("/orders");
  await page.getByRole("button", { name: "View details", exact: true }).click();
  await expect(
    page.getByText("Tracking: BROWSER-TRACK-001", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Request refund review" }).click();
  await expect(
    page.getByText("Refund requested", { exact: true }),
  ).toBeVisible();
  expect((await state(page)).me.balance).toBe(600);
  await login(page, "mira");
  expect(
    (await action(page, "fulfil", { id: "AST-24809", tracking: "OVERWRITE" }))
      .status,
  ).toBe(409);
});
test("creators exchange private messages and outsiders cannot read them", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/messages?thread=thread-reel");
  await page.getByLabel("Your message").fill("Private browser-test message");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("log")).toContainText(
    "Private browser-test message",
  );
  await expect(page.getByLabel("Your message")).toHaveValue("");
  await login(page, "eli");
  await page.goto("/studio/messages?thread=thread-reel");
  await expect(page.getByRole("log")).toContainText(
    "Private browser-test message",
  );
  await login(page, "jonah");
  expect(
    (await state(page)).messages.some(
      (m: { text: string }) => m.text === "Private browser-test message",
    ),
  ).toBe(false);
});
test("landing remains public but creator profiles require sign-in", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("AStra");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 2,
    ),
  ).toBe(true);
  await page.goto("/creators/nonexistent-creator");
  await expect(page).toHaveURL(/\/signin$/);
  await login(page, "alex");
  await page.goto("/creators/nonexistent-creator");
  await expect(
    page.getByRole("heading", { name: "Creator not found" }),
  ).toBeVisible();
  const r = await page.goto("/unknown-page");
  expect(r?.status()).toBe(404);
});

test("audience signs in, browses creators, favorites, and logs out", async ({
  page,
}) => {
  await login(page, "alex");
  await page.goto("/discover");
  await page.getByLabel("Search creators").fill("Mira");
  await expect(
    page.getByText("Mira Rao", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Favorited", exact: true }).click();
  await expect
    .poll(async () => (await state(page)).me.favorites.includes("mira"))
    .toBe(false);
  await page.getByRole("button", { name: "Favorite", exact: true }).click();
  await expect
    .poll(async () => (await state(page)).me.favorites.includes("mira"))
    .toBe(true);
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .last()
    .click();
  await expect
    .poll(async () => (await page.request.get(base + "/api/app")).status())
    .toBe(401);
  await page.goto("/studio/collaborate");
  await expect(page.getByLabel("Search opportunities")).toHaveCount(0);
});
test("audience buys a ticket using capped points and sees an order receipt", async ({
  page,
}) => {
  await login(page, "alex");
  await page.goto("/events/color-after-hours");
  await page.getByRole("button", { name: /Add.*cart/i }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Use available maximum" }).click();
  await expect(
    page.getByLabel("Points for Color After Hours", { exact: false }),
  ).toHaveValue("500");
  await page.getByRole("button", { name: "Confirm sample purchase" }).click();
  await expect(
    page.getByRole("heading", { name: "Thanks for backing the work" }),
  ).toBeVisible();
  const s = await state(page);
  expect(s.me.balance).toBe(100);
  expect(s.cart).toHaveLength(0);
  await page
    .getByRole("link", { name: "View your orders", exact: true })
    .click();
  await expect(
    page.getByText("Ticket issued", { exact: true }).first(),
  ).toBeVisible();
});
test("creator publishes a post and audience can see it but not edit it", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/publish");
  await page.getByLabel(/^Title/).fill("Browser-tested artwork");
  await page
    .getByLabel(/^Description/)
    .fill("A painting and a filmmaker working together.");
  await page.getByRole("button", { name: "Publish post", exact: true }).click();
  await expect
    .poll(async () =>
      (await state(page)).myPosts.some(
        (p: { title: string }) => p.title === "Browser-tested artwork",
      ),
    )
    .toBe(true);
  await login(page, "alex");
  await expect(
    page.getByRole("heading", { name: "Browser-tested artwork" }),
  ).toBeVisible();
  const s = await state(page),
    post = s.posts.find(
      (p: { title: string }) => p.title === "Browser-tested artwork",
    );
  expect(
    (await action(page, "content-status", { id: post.id, status: "delete" }))
      .status,
  ).toBe(403);
});
test("creator saves an unpublished draft without leaking it into the audience feed", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/publish");
  await page.getByLabel(/^Title/).fill("Private draft artwork");
  await page.getByLabel(/^Description/).fill("Not ready for publication.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect
    .poll(async () =>
      (await state(page)).myPosts.some(
        (p: { title: string; published: boolean }) =>
          p.title === "Private draft artwork" && !p.published,
      ),
    )
    .toBe(true);
  await login(page, "alex");
  await expect(page.getByText("Private draft artwork")).toHaveCount(0);
});
test("creator publishes YouTube demo; audience receives exactly one simulated award", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/publish");
  await page.getByRole("button", { name: "YouTube", exact: true }).click();
  await page
    .getByLabel("YouTube video or Shorts link")
    .fill("https://youtu.be/abcdefghijk");
  await page.getByLabel("Post title").fill("Browser YouTube release");
  await page
    .getByLabel("A message for your audience")
    .fill("Simulated link only.");
  await page.getByRole("button", { name: "Publish YouTube post" }).click();
  await expect(
    page.getByRole("button", { name: "Published", exact: true }),
  ).toBeVisible();
  await login(page, "alex");
  const before = (await state(page)).me.balance;
  await page
    .getByRole("button", {
      name: "Open in YouTube · +1 demo points",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL("https://www.youtube.com/watch?v=abcdefghijk");
  await page.goto(base + "/feed");
  await expect(
    page.getByRole("button", { name: "Open in YouTube · already rewarded" }),
  ).toBeVisible();
  expect((await state(page)).me.balance).toBe(before + 1);
  const campaign = (await state(page)).demoCampaigns.find(
    (c: { title: string }) => c.title === "Browser YouTube release",
  );
  expect(
    (await action(page, "demo-link-open", { id: campaign.id })).body.result
      .awarded,
  ).toBe(0);
});
test("creator creates an opportunity, collaborator responds once, audience cannot see it", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/collaborate/new");
  await page.getByLabel("Opportunity title").fill("Painter meets filmmaker");
  await page
    .getByLabel("Tell creators about the project")
    .fill("A film about a painting.");
  await page.getByLabel("Looking for a").selectOption("video");
  await page.getByLabel("What will you make?").fill("One short video");
  await page.getByLabel(/^Timing/).fill("October 2026");
  await page.getByRole("button", { name: "Publish opportunity" }).click();
  await expect(page).toHaveURL(/\/studio\/collaborate\/(?!new)[^/]+$/);
  const path = new URL(page.url()).pathname;
  await login(page, "eli");
  await page.goto(path);
  await page
    .getByLabel("A short note to the creator")
    .fill("I can film your painting.");
  await page
    .getByRole("button", { name: /Send.*response|Send.*interest/i })
    .click();
  await expect
    .poll(async () =>
      (await state(page)).responses.some(
        (r: { opportunity: string; user: string }) =>
          r.opportunity === path.split("/").pop() && r.user === "eli",
      ),
    )
    .toBe(true);
  expect(
    (
      await action(page, "respond", {
        id: path.split("/").pop(),
        message: "Duplicate",
      })
    ).status,
  ).toBe(409);
  await login(page, "alex");
  await page.goto(path);
  await expect(page.getByText("Painter meets filmmaker")).toHaveCount(0);
});
test("settings persist and creator/audience role switching protects collaboration", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/settings");
  await page.getByLabel("Allow ambient animation in the workspace").uncheck();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect
    .poll(async () => (await state(page)).me.settings.motion)
    .toBe(false);
  await page.reload();
  await expect(
    page.getByLabel("Allow ambient animation in the workspace"),
  ).not.toBeChecked();
  expect((await action(page, "switch", { view: "audience" })).status).toBe(200);
  await page.goto("/studio/messages");
  await expect(page.getByLabel("Your message", { exact: true })).toHaveCount(0);
  expect((await state(page)).messages).toBeUndefined();
});
test("invalid points cannot debit the wallet; a corrected purchase succeeds", async ({
  page,
}) => {
  await login(page, "alex");
  await action(page, "cart", { id: "color-after-hours", quantity: 1 });
  await page.goto("/cart");
  const points = page.getByLabel(/Points for/);
  await points.fill("501");
  await page.getByRole("button", { name: "Confirm sample purchase" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Points for/ }),
  ).toBeVisible();
  expect((await state(page)).me.balance).toBe(600);
  await points.fill("500");
  await page.getByRole("button", { name: "Confirm sample purchase" }).click();
  await expect(
    page.getByRole("heading", { name: "Thanks for backing the work" }),
  ).toBeVisible();
});
test("network failure is recoverable without losing the signed-in account", async ({
  page,
}) => {
  await login(page, "alex");
  await page.goto("/settings");
  await page.route("**/api/app", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.locator(".feedback.error")).toBeVisible();
  await page.unroute("**/api/app");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByText("Preferences saved.", { exact: true }),
  ).toBeVisible();
});
test("key pages fit viewport and show no runtime errors", async ({
  page,
}, info) => {
  await login(page, "alex");
  for (const path of [
    "/feed",
    "/discover",
    "/settings",
    "/loyalty",
    "/orders",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 2,
      ),
      path + " has no horizontal page overflow",
    ).toBe(true);
  }
  await page.screenshot({
    path: info.outputPath("audience.png"),
    fullPage: true,
  });
  await login(page, "mira");
  for (const path of [
    "/studio",
    "/studio/publish",
    "/studio/collaborate",
    "/studio/messages",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 2,
      ),
      path + " has no horizontal page overflow",
    ).toBe(true);
  }
  await page.screenshot({
    path: info.outputPath("creator.png"),
    fullPage: true,
  });
});

for (const role of ["audience", "creator"])
  test(`new ${role} can register with zero points and select favorite creators`, async ({
    page,
  }) => {
    await page.goto("/signin");
    await page.getByRole("button", { name: "Join", exact: true }).click();
    await page.getByLabel("Sample display name").fill("Browser new " + role);
    await page.getByLabel("I’m here as", { exact: true }).selectOption(role);
    await page.getByRole("button", { name: "Create sample account" }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(
      page.getByRole("heading", {
        name: "Pick a few creators to start your feed",
      }),
    ).toBeVisible();
    const s = await state(page);
    expect(s.me.balance).toBe(0);
    expect(s.me.roles).toEqual([role]);
    await page
      .getByRole("button", { name: "Add favorite", exact: true })
      .first()
      .click();
    await expect
      .poll(async () => (await state(page)).me.favorites.length)
      .toBe(1);
  });
test("empty publish form and unsafe provider link are rejected without creating content", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/publish");
  const count = (await state(page)).myPosts.length;
  await page.getByRole("button", { name: "Publish post", exact: true }).click();
  expect(
    await page
      .getByLabel(/^Title/)
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing),
  ).toBe(true);
  expect((await state(page)).myPosts.length).toBe(count);
  await page.getByRole("button", { name: "YouTube", exact: true }).click();
  await page
    .getByLabel("YouTube video or Shorts link")
    .fill("https://youtube.com.evil.test/watch?v=abcdefghijk");
  await expect(
    page.getByRole("button", { name: "Publish YouTube post" }),
  ).toBeDisabled();
});
test("creator publishes Spotify and audience sees the official embed without playback credit", async ({
  page,
}) => {
  await login(page, "mira");
  await page.goto("/studio/publish");
  await page.getByRole("button", { name: "Spotify", exact: true }).click();
  await page
    .getByLabel("Spotify song or album link")
    .fill(`https://open.spotify.com/track/${"A".repeat(22)}`);
  await page.getByLabel("Post title").fill("Browser Spotify song");
  await page
    .getByLabel("A message for your audience")
    .fill("New song. Demo rewards only.");
  await page.getByRole("button", { name: "Publish Spotify post" }).click();
  await expect(
    page.getByRole("button", { name: "Published", exact: true }),
  ).toBeVisible();
  await login(page, "alex");
  await expect(
    page.locator('iframe[title="Spotify track preview: Browser Spotify song"]'),
  ).toHaveAttribute(
    "src",
    `https://open.spotify.com/embed/track/${"A".repeat(22)}?theme=0`,
  );
  expect((await state(page)).me.balance).toBe(600);
});
for (const provider of ["youtube", "spotify"])
  test(`${provider} consent cancellation shows a safe error and creates no account`, async ({
    page,
  }) => {
    await page.route(
      provider === "youtube"
        ? "https://accounts.google.com/**"
        : "https://accounts.spotify.com/**",
      async (route) => {
        const auth = new URL(route.request().url());
        const callback = new URL(
          `/api/integrations/${provider}/callback`,
          base,
        );
        callback.searchParams.set("state", auth.searchParams.get("state")!);
        callback.searchParams.set("error", "access_denied");
        await route.fulfill({
          status: 302,
          headers: { location: callback.href },
          body: "",
        });
      },
    );
    await action(page, "signup", {
      name: "Connection tester",
      email: `connection-${provider}-${Date.now()}@example.test`,
      password: "Private connection passphrase",
      role: "audience",
    });
    await page.goto("/settings");
    await page
      .getByRole("button", {
        name: provider === "youtube" ? "Connect YouTube" : "Connect Spotify",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: /permission was cancelled/ }),
    ).toBeVisible();
    expect((await state(page)).me.authProvider).toBe("password");
  });
