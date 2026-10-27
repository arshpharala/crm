import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/contacts", label: "Contacts" },
  { href: "/deals", label: "Deals" },
  { href: "/properties", label: "Properties" },
  { href: "/developers", label: "Developers & Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/meetings", label: "Meetings" },
  { href: "/settings/integrations", label: "Integrations" },
];

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-lg font-bold text-slate-900">BIG B Properties</p>
          <p className="text-xs text-slate-500">Real Estate CRM</p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <p className="truncate px-2 text-sm font-medium text-slate-900">{session?.user?.name}</p>
          <p className="truncate px-2 text-xs text-slate-500">{session?.user?.role?.replaceAll("_", " ")}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="mt-2"
          >
            <button className="w-full rounded-md px-2 py-2 text-left text-sm text-slate-600 hover:bg-slate-100">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
