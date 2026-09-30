import type { Metadata } from "next";
import Link from "next/link";
import NavLink from "@/components/NavLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Tracker",
  description: "Track feature issues and manage projects for the employee portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">Portal Tracker</Link>
          <nav>
            <NavLink href="/" match={["/", "/features"]}>Features</NavLink>
            <NavLink href="/projects" match={["/projects", "/tasks"]}>Projects</NavLink>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
