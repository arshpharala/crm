import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { createTeam, createUser } from "../actions";
import { Card, PageHeader, SectionTitle, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default async function NewUserPage() {
  const session = await auth();

  if (!session?.user || !canManageUsers(session.user.role)) {
    return (
      <div>
        <PageHeader title="New User" />
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">You don&apos;t have permission to manage users.</p>
        </Card>
      </div>
    );
  }

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="grid max-w-3xl grid-cols-3 gap-6">
      <div className="col-span-2">
        <PageHeader title="New User" />
        <Card className="p-6">
          <form action={createUser} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="name">Full Name *</label>
              <input id="name" name="name" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Phone</label>
              <input id="phone" name="phone" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="password">Temporary Password *</label>
              <input id="password" name="password" type="password" required minLength={6} className={inputClass} />
            </div>

            <div>
              <label className={labelClass} htmlFor="role">Role *</label>
              <select id="role" name="role" required className={inputClass} defaultValue="AGENT">
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="teamId">Team</label>
              <select id="teamId" name="teamId" className={inputClass} defaultValue="">
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 mt-2">
              <SubmitButton>Create User</SubmitButton>
            </div>
          </form>
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <SectionTitle>Quick Add Team</SectionTitle>
          <form action={createTeam} className="space-y-3">
            <input name="teamName" placeholder="Team name" required className={inputClass} />
            <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add Team
            </button>
          </form>
          {teams.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {teams.map((team) => (
                <li key={team.id}>{team.name}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
