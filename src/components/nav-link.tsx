"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon && (
        <span className={active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}>
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </Link>
  );
}
