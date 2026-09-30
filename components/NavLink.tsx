"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Top-menu link that is highlighted when you're inside its section.
// `match` lists the URL prefixes that count as "inside" (e.g. Features covers / and /features/...)
export default function NavLink({ href, match, children }: { href: string; match: string[]; children: React.ReactNode }) {
  const path = usePathname();
  const active = match.some((m) => (m === "/" ? path === "/" : path.startsWith(m)));
  return (
    <Link href={href} className={"nav-link" + (active ? " active" : "")}>
      {children}
    </Link>
  );
}
