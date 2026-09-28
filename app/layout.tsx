import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feature Tracker",
  description: "Track issues, actions and decisions for each employee portal feature",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">Feature Tracker</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
