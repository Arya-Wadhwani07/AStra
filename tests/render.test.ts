import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { Provider } from "../src/components/app-context";
import { Website } from "../src/components/website";
import {
  seed,
  snapshot,
  mutate,
  type Session,
  type State,
} from "../src/lib/model";
const routes = [
  "/",
  "/signin",
  "/onboarding",
  "/feed",
  "/discover",
  "/creators/mira-rao",
  "/events/color-after-hours",
  "/cart",
  "/loyalty",
  "/orders",
  "/notifications",
  "/settings",
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
const router = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
  hmrRefresh() {},
  bfcacheId: "test",
};
function render(
  path: string,
  session?: Session,
  prepare?: (data: State) => void,
) {
  const data = seed();
  prepare?.(data);
  data.carts.alex = [{ item: "color-after-hours", quantity: 1 }];
  return renderToString(
    React.createElement(
      AppRouterContext.Provider,
      { value: router },
      React.createElement(
        PathnameContext.Provider,
        { value: path },
        React.createElement(
          SearchParamsContext.Provider,
          { value: new URLSearchParams() },
          React.createElement(Provider, {
            initialState: snapshot(data, session),
            children: React.createElement(Website, { path, title: path }),
          }),
        ),
      ),
    ),
  );
}
for (const path of routes)
  test(`renders populated route ${path}`, () => {
    const session: Session =
      path === "/admin"
        ? { user: "admin", view: "admin" }
        : path.startsWith("/studio")
          ? { user: "mira", view: "creator" }
          : { user: "alex", view: "audience" };
    const html = render(path, session);
    assert.ok(html.length > 500);
    assert.ok(!html.includes("[object Object]"));
  });
test("published Spotify release renders an official player and separate one-time reward button in the feed", () => {
  const previous = process.env.ASTRA_DEMO;
  process.env.ASTRA_DEMO = "1";
  try {
    const html = render("/feed", { user: "alex", view: "audience" }, (data) => {
      mutate(data, { user: "mira", view: "creator" }, "campaign", {
        title: "Spotify feed test",
        rule: "New release",
        demo: true,
        link: `https://open.spotify.com/track/${"A".repeat(22)}`,
        demoPoints: 1,
      });
    });
    assert.match(html, /Spotify feed test/);
    assert.match(
      html,
      /https:\/\/open.spotify.com\/embed\/track\/A{22}\?theme=0/,
    );
    assert.match(html, /Open in Spotify · \+1 demo points/);
    assert.match(html, /Playing the preview does not award points/);
    assert.match(html, /loading="lazy"/);
    assert.doesNotMatch(html, /autoplay=1/);
  } finally {
    if (previous === undefined) delete process.env.ASTRA_DEMO;
    else process.env.ASTRA_DEMO = previous;
  }
});
test("a feed Spotify card shares claimed status with the loyalty page", () => {
  const previous = process.env.ASTRA_DEMO;
  process.env.ASTRA_DEMO = "1";
  try {
    const html = render("/feed", { user: "alex", view: "audience" }, (data) => {
      mutate(data, { user: "mira", view: "creator" }, "campaign", {
        title: "Claimed release",
        rule: "Demo",
        demo: true,
        link: `https://open.spotify.com/track/${"A".repeat(22)}`,
        demoPoints: 1,
      });
      mutate(data, { user: "alex", view: "audience" }, "demo-link-open", {
        id: data.campaigns[0].id,
      });
    });
    assert.match(html, /Demo points received/);
    assert.match(html, /Open in Spotify · already rewarded/);
  } finally {
    if (previous === undefined) delete process.env.ASTRA_DEMO;
    else process.env.ASTRA_DEMO = previous;
  }
});
test("YouTube feed starts with an opt-in preview, separate simulated reward and no tracking iframe", () => {
  const old = process.env.ASTRA_DEMO;
  process.env.ASTRA_DEMO = "1";
  try {
    const html = render("/feed", { user: "alex", view: "audience" }, (data) => {
      mutate(data, { user: "mira", view: "creator" }, "campaign", {
        title: "Video feed test",
        rule: "Demo only",
        demo: true,
        link: "https://youtu.be/abcdefghijk",
        demoPoints: 2,
      });
    });
    assert.match(html, /Video feed test/);
    assert.match(html, /Load YouTube preview/);
    assert.match(html, /Open in YouTube · \+2 demo points/);
    assert.match(html, /Not a verified view/);
    assert.doesNotMatch(html, /youtube-nocookie.com\/embed/);
  } finally {
    if (old === undefined) delete process.env.ASTRA_DEMO;
    else process.env.ASTRA_DEMO = old;
  }
});
test("both role settings and sign-in render YouTube connection controls", () => {
  for (const session of [
    { user: "alex", view: "audience" as const },
    { user: "mira", view: "creator" as const },
  ])
    assert.match(render("/settings", session), /Connect YouTube/);
  assert.match(render("/signin"), /Connect YouTube/);
});
test("audience sees no private opportunity or messages markup", () => {
  const html = render("/studio/collaborate", {
    user: "alex",
    view: "audience",
  });
  assert.ok(html.includes("A space just for creators"));
  assert.ok(!html.includes("30-second launch reel"));
  const messages = render("/studio/messages", {
    user: "alex",
    view: "audience",
  });
  assert.ok(!messages.includes("updated the brief"));
});
test("public discovery renders without an account", () => {
  const html = render("/discover");
  assert.ok(html.includes("Mira Rao"));
  assert.ok(html.includes("Find your next favorite"));
});
test("collaborator renders response and participant messaging views", () => {
  assert.ok(
    render("/studio/collaborate/launch-reel", {
      user: "eli",
      view: "creator",
    }).includes("Response sent"),
  );
  assert.ok(
    render("/studio/messages", { user: "eli", view: "creator" }).includes(
      "updated the brief",
    ),
  );
});
