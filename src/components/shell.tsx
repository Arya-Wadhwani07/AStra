"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useApp } from "./app-context";
import { Icon } from "./icons";
import { Logo, Avatar, Ambient, Button, Feedback, Empty, Go } from "./ui";
export const audienceNav = [
  ["/feed", "Your feed", "house"],
  ["/discover", "Discover", "compass"],
  ["/cart", "Cart", "shopping-cart"],
  ["/loyalty", "Loyalty points", "star-four"],
  ["/orders", "Your orders", "package"],
];
export const creatorNav = [
  ["/studio", "Overview", "squares-four"],
  ["/studio/publish", "Publish", "plus"],
  ["/studio/profile", "Your profile", "palette"],
  ["/studio/insights", "Audience insights", "chart-line-up"],
  ["/studio/orders", "Orders", "package"],
  ["/studio/loyalty", "Loyalty settings", "star-four"],
  ["/studio/collaborate", "Collaborate", "handshake"],
  ["/studio/collaborations", "My collaborations", "users-three"],
  ["/studio/community", "Community", "globe-simple"],
  ["/studio/messages", "Messages", "chat-circle-text"],
];
export function Shell({
  children,
  title,
  privatePage = false,
  admin = false,
  publicPage = false,
}: {
  children: ReactNode;
  title: string;
  privatePage?: boolean;
  admin?: boolean;
  publicPage?: boolean;
}) {
  const { state, act, busy, reload, error } = useApp();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const creator = state?.view === "creator";
  const nav = admin
    ? [["/admin", "Review queue", "shield-check"]]
    : creator
      ? creatorNav
      : audienceNav;
  const gated =
    (!state?.me && !publicPage) ||
    (privatePage && !creator) ||
    (admin && state?.view !== "admin");
  const switchRole = async () => {
    const view = creator ? "audience" : "creator";
    const result = await act("switch", { view });
    if (result.ok) router.push(view === "creator" ? "/studio" : "/feed");
  };
  const links = nav.map(([href, text, icon]) => (
    <Link
      key={href}
      href={href}
      className={`as-navitem ${path === href ? "is-selected" : ""}`}
      aria-current={path === href ? "page" : undefined}
      onClick={() => setMenu(false)}
    >
      <Icon name={icon} weight={path === href ? "fill" : "regular"} />
      <span>{text}</span>
      {creator && /collab|community|messages/.test(href) && (
        <Icon name="lock-simple" size={14} />
      )}
    </Link>
  ));
  return (
    <div
      className="app-layout as-app--glass"
      data-theme="glass"
      data-motion={state?.me?.settings.motion === false ? "off" : "on"}
    >
      <Ambient
        drift={
          !privatePage && ["/feed", "/discover", "/loyalty"].includes(path)
        }
        quiet={admin}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Link href="/" className="brand">
          <Logo />
        </Link>
        <div className="sidebar-label">
          {admin
            ? "Administration"
            : creator
              ? "Creator workspace"
              : "Your creative world"}
        </div>
        {state?.me?.roles.includes("audience") &&
          state.me.roles.includes("creator") && (
            <Button
              variant="secondary"
              icon="arrows-left-right"
              onClick={switchRole}
              busy={busy}
            >
              Viewing as {creator ? "creator" : "audience"}
            </Button>
          )}
        <nav aria-label="Main navigation" className="nav-stack">
          {links}
        </nav>
        <div className="sidebar-bottom">
          <Link className="as-navitem" href="/notifications">
            <Icon name="bell" />
            Notifications
            {state?.notices.some((n) => !n.read) && (
              <span className="notification-dot" />
            )}
          </Link>
          <Link className="as-navitem" href="/settings">
            <Icon name="gear-six" />
            Settings
          </Link>
          {state?.me ? (
            <>
              <div className="account">
                <Avatar name={state.me.name} size={36} />
                <div>
                  <strong>{state.me.name}</strong>
                  <small>
                    {state.me.authProvider
                      ? "Private account"
                      : "Local demo account"}
                  </small>
                </div>
              </div>
              <Button
                variant="quiet"
                icon="sign-out"
                onClick={async () => {
                  await act("logout");
                  router.push("/");
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Go href="/signin">Sign in</Go>
          )}
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-only icon-button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
          >
            <Icon name={menu ? "x" : "list"} />
          </button>
          <h1>{title}</h1>
          <div className="topbar-tools">
            <Link
              href="/notifications"
              className="icon-button"
              aria-label="Notifications"
            >
              <Icon name="bell" />
            </Link>
            {state?.me && <Avatar name={state.me.name} size={32} />}
          </div>
        </header>
        <main id="main" className="page-content">
          <Feedback />
          {!state ? (
            <Empty
              title={
                error ? "Connection unavailable" : "Opening your workspace"
              }
              text={error || "Loading your workspace."}
            >
              {error && (
                <Button onClick={() => void reload()}>Try again</Button>
              )}
            </Empty>
          ) : gated ? (
            <Empty
              title={
                privatePage
                  ? "A space just for creators"
                  : admin
                    ? "Administrator access required"
                    : "Make yourself at home"
              }
              text={
                privatePage
                  ? "Private opportunities, briefs and conversations are available only in an authorized creator view."
                  : "Sign in to your AStra account to continue."
              }
            >
              {state.me?.roles.includes("creator") && privatePage ? (
                <Button onClick={switchRole}>Switch to creator</Button>
              ) : (
                <Go href="/signin">Sign in</Go>
              )}
            </Empty>
          ) : (
            children
          )}
        </main>
        <footer className="app-footer">
          Simulated checkout. No real payments or emails.
        </footer>
      </div>
      {state?.me && !admin && (
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {(creator
            ? creatorNav.filter((n) =>
                [
                  "/studio",
                  "/studio/publish",
                  "/studio/collaborate",
                  "/studio/community",
                ].includes(n[0]),
              )
            : audienceNav.slice(0, 4)
          ).map(([href, text, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon name={icon} weight={path === href ? "fill" : "regular"} />
              <span>{text === "Loyalty points" ? "Points" : text}</span>
            </Link>
          ))}
          <button onClick={() => setMenu(!menu)} aria-label="More navigation">
            <Icon name="list" />
            <span>More</span>
          </button>
        </nav>
      )}
    </div>
  );
}
