import { notFound } from "next/navigation";
import { Website } from "@/components/website";
import type { Metadata } from "next";
const routes: Record<string, string> = {
  "/": "Where creative worlds meet",
  "/signin": "Sign in",
  "/onboarding": "Pick your creators",
  "/feed": "Your feed",
  "/discover": "Discover",
  "/cart": "Cart and checkout",
  "/loyalty": "Loyalty points",
  "/orders": "Your orders",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/studio": "Overview",
  "/studio/setup": "Creator setup",
  "/studio/profile": "Edit profile",
  "/studio/publish": "Publish",
  "/studio/insights": "Audience insights",
  "/studio/orders": "Creator orders",
  "/studio/loyalty": "Loyalty settings",
  "/studio/community": "Community",
  "/studio/collaborate": "Find opportunities",
  "/studio/collaborate/new": "Create opportunity",
  "/studio/collaborations": "My collaborations",
  "/studio/messages": "Messages",
  "/studio/menu": "Creator menu",
  "/admin": "Review queue",
};
type Props = { params: Promise<{ slug?: string[] }> };
function resolve(slug?: string[]) {
  const path = "/" + (slug || []).join("/");
  const title =
    routes[path] ||
    (/^\/creators\/[^/]+$/.test(path)
      ? "Creator profile"
      : /^\/events\/[^/]+$/.test(path)
        ? "Event details"
        : /^\/studio\/collaborate\/[^/]+$/.test(path)
          ? "Opportunity"
          : "");
  return { path, title };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: resolve((await params).slug).title || "Page not found" };
}
export default async function Page({ params }: Props) {
  const { path, title } = resolve((await params).slug);
  if (!title) notFound();
  return <Website path={path} title={title} />;
}
