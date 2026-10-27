import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";
import { Avatar } from "@/components/ui";
import {
  GridIcon,
  TargetIcon,
  UserIcon,
  BriefcaseIcon,
  BuildingIcon,
  Building2Icon,
  CheckSquareIcon,
  CalendarIcon,
  MessageIcon,
  PlugIcon,
  LogOutIcon,
} from "@/components/icons";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [{ href: "/dashboard", label: "Dashboard", icon: <GridIcon size={17} /> }],
  },
  {
    label: "CRM",
    items: [
      { href: "/leads", label: "Leads", icon: <TargetIcon size={17} /> },
      { href: "/contacts", label: "Contacts", icon: <UserIcon size={17} /> },
      { href: "/deals", label: "Deals", icon: <BriefcaseIcon size={17} /> },
      { href: "/properties", label: "Properties", icon: <BuildingIcon size={17} /> },
      { href: "/developers", label: "Developers & Projects", icon: <Building2Icon size={17} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/tasks", label: "Tasks", icon: <CheckSquareIcon size={17} /> },
      { href: "/meetings", label: "Meetings", icon: <CalendarIcon size={17} /> },
      { href: "/whatsapp", label: "WhatsApp Inbox", icon: <MessageIcon size={17} /> },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/settings/integrations", label: "Integrations", icon: <PlugIcon size={17} /> }],
  },
];

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? "";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col bg-slate-900 px-3 py-5">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            B
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">BIG B Properties</p>
            <p className="text-[11px] leading-tight text-slate-400">Real Estate CRM</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} href={item.href} icon={item.icon}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2.5">
          <Avatar name={name || "?"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-[11px] text-slate-400">{session?.user?.role?.replaceAll("_", " ")}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              title="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <LogOutIcon size={15} />
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] p-8">{children}</div>
      </main>
    </div>
  );
}
