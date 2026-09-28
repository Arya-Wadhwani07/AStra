"use client";
import { Shell } from "./shell";
import { Landing, SignIn, Onboarding } from "./public-pages";
import {
  Feed,
  Discover,
  Profile,
  EventDetail,
  Checkout,
  Loyalty,
  Orders,
  Notifications,
  Settings,
} from "./audience-pages";
import {
  Dashboard,
  ProfileEdit,
  Publish,
  CreatorLoyalty,
  Insights,
  CreatorMenu,
  Admin,
} from "./creator-pages";
import {
  CollabFind,
  CollabCreate,
  CollabRespond,
  MyCollabs,
  Messages,
  Community,
} from "./collaboration-pages";
export function Website({
  path,
  title,
  testAccounts = false,
}: {
  path: string;
  title: string;
  testAccounts?: boolean;
}) {
  if (path === "/") return <Landing />;
  if (path === "/signin") return <SignIn testAccounts={testAccounts} />;
  if (path === "/onboarding") return <Onboarding />;
  const routes: Record<string, React.ReactNode> = {
    "/feed": <Feed />,
    "/discover": <Discover />,
    "/cart": <Checkout />,
    "/loyalty": <Loyalty />,
    "/orders": <Orders />,
    "/notifications": <Notifications />,
    "/settings": <Settings />,
    "/studio": <Dashboard />,
    "/studio/setup": <ProfileEdit setup />,
    "/studio/profile": <ProfileEdit />,
    "/studio/publish": <Publish />,
    "/studio/insights": <Insights />,
    "/studio/orders": <Orders seller />,
    "/studio/loyalty": <CreatorLoyalty />,
    "/studio/community": <Community />,
    "/studio/collaborate": <CollabFind />,
    "/studio/collaborate/new": <CollabCreate />,
    "/studio/collaborations": <MyCollabs />,
    "/studio/messages": <Messages />,
    "/studio/menu": <CreatorMenu />,
    "/admin": <Admin />,
  };
  const page =
    routes[path] ||
    (path.startsWith("/creators/") ? (
      <Profile creatorId={path.split("/")[2]} />
    ) : path.startsWith("/events/") ? (
      <EventDetail id={path.split("/")[2]} />
    ) : (
      <CollabRespond id={path.split("/")[3]} />
    ));
  return (
    <Shell
      title={title}
      privatePage={path.startsWith("/studio")}
      admin={path === "/admin"}
    >
      {page}
    </Shell>
  );
}
