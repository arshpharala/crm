import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { Building2Icon, PlusIcon } from "@/components/icons";

export default async function DevelopersPage() {
  const developers = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { projects: true },
  });

  return (
    <div>
      <PageHeader
        title="Developers"
        subtitle={`${developers.length} developers`}
        action={
          <LinkButton href="/developers/new">
            <PlusIcon size={16} /> New Developer
          </LinkButton>
        }
      />

      {developers.length === 0 ? (
        <EmptyState message="No developers yet." icon={<Building2Icon size={28} />} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {developers.map((dev) => (
            <Link key={dev.id} href={`/developers/${dev.id}`}>
              <Card className="p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Building2Icon size={18} />
                </div>
                <p className="font-medium text-slate-900">{dev.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {dev.city ? `${dev.city} · ` : ""}{dev.projects.length} project(s)
                </p>
                {dev.registrationStatus && <p className="mt-1 text-xs text-slate-400">{dev.registrationStatus}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
