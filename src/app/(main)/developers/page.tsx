import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default async function DevelopersPage() {
  const developers = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { projects: true },
  });

  return (
    <div>
      <PageHeader
        title="Developers"
        action={
          <Link href="/developers/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            + New Developer
          </Link>
        }
      />

      {developers.length === 0 ? (
        <EmptyState message="No developers yet." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {developers.map((dev) => (
            <Link key={dev.id} href={`/developers/${dev.id}`}>
              <Card className="p-5 hover:border-slate-300">
                <p className="font-medium text-slate-900">{dev.name}</p>
                <p className="mt-1 text-sm text-slate-500">{dev.projects.length} project(s)</p>
                {dev.registrationStatus && <p className="mt-1 text-xs text-slate-400">{dev.registrationStatus}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
