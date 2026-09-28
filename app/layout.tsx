import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feature Feedback Tracker",
  description: "Track employee feedback against portal features and the decisions made",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">Feedback Tracker</Link>
          <nav>
            <Link href="/">Feedback</Link>
            <Link href="/features">Features</Link>
            <Link href="/feedback/new" className="btn primary small">+ New</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
