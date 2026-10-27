import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, inputClass, labelClass } from "@/components/ui";
import { createProject } from "../actions";

export default async function DeveloperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const developer = await prisma.company.findUnique({
    where: { id },
    include: { projects: { include: { properties: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!developer) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader title={developer.name} />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Website:</span> <span className="font-medium">{developer.website ?? "-"}</span></div>
            <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{developer.contactDetails ?? "-"}</span></div>
            <div><span className="text-slate-500">Registration:</span> <span className="font-medium">{developer.registrationStatus ?? "-"}</span></div>
            <div><span className="text-slate-500">Commission:</span> <span className="font-medium">{developer.commissionTerms ?? "-"}</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Projects</h2>
          {developer.projects.length === 0 ? (
            <p className="text-sm text-slate-400">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {developer.projects.map((project) => (
                <div key={project.id} className="rounded-md border border-slate-100 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{project.name}</span>
                    <span className="text-slate-500">{project.properties.length} unit(s)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {project.location ?? "-"} · Starting {project.startingPrice ? `AED ${project.startingPrice}` : "-"} ·{" "}
                    {project.status ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Add Project</h2>
          <form action={createProject} className="space-y-3">
            <input type="hidden" name="developerId" value={developer.id} />
            <div>
              <label className={labelClass} htmlFor="name">Project Name *</label>
              <input id="name" name="name" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="location">Location</label>
              <input id="location" name="location" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="masterCommunity">Master Community</label>
              <input id="masterCommunity" name="masterCommunity" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="status">Status</label>
              <input id="status" name="status" className={inputClass} placeholder="Launched, Under construction..." />
            </div>
            <div>
              <label className={labelClass} htmlFor="startingPrice">Starting Price (AED)</label>
              <input id="startingPrice" name="startingPrice" type="number" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="expectedCompletion">Expected Completion</label>
              <input id="expectedCompletion" name="expectedCompletion" type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="paymentPlan">Payment Plan</label>
              <input id="paymentPlan" name="paymentPlan" className={inputClass} placeholder="60/40, 1% monthly..." />
            </div>
            <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add Project
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
