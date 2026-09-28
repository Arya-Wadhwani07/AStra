import type { Metadata } from "next";
import { Provider } from "@/components/app-context";
import "@/styles/fonts.css";
import "@/styles/tokens.css";
import "@/styles/components.css";
import "@/styles/app.css";
export const metadata: Metadata = {
  title: {
    default: "AStra | Where creative worlds meet",
    template: "%s | AStra",
  },
  description:
    "A shared home for creators, their audiences and cross-discipline collaboration. Local working prototype.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="glass">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
