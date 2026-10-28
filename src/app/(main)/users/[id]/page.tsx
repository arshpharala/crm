import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { resetPassword, toggleUserActive, updateUser } from "../actions";
import { Avatar, Badge, Card, PageHeader, SectionTitle, inputClass, labelClass } from "@/components/ui";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || !canManageUsers(session.user.role)) {
    return (
      <div>
        <PageHeader title="User" />
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">You don&apos;t have permission to manage users.</p>
        </Card>
      </div>
    );
  }

  const [user, teams] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { team: true } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  const isSelf = session.user.id === user.id;
  const isCurrentTeamLeader = user.team?.leaderId === user.id;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader
          title={user.name}
          subtitle={user.email}
          action={<Badge color={user.active ? "green" : "slate"} dot>{user.active ? "Active" : "Inactive"}</Badge>}
        />

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="font-medium text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <form action={updateUser} className="grid grid-cols-2 gap-4">
            <input type="hidden" name="userId" value={user.id} />
            <div className="col-span-2">
              <label className={labelClass} htmlFor="name">Full Name</label>
              <input id="name" name="name" defaultValue={user.name} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Phone</label>
              <input id="phone" name="phone" defaultValue={user.phone ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="role">Role</label>
              <select id="role" name="role" defaultValue={user.role} className={inputClass}>
                {Object.values(Role).map((role) => (
                  <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="teamId">Team</label>
              <select id="teamId" name="teamId" defaultValue={user.teamId ?? ""} className={inputClass}>
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                id="isTeamLeader"
                name="isTeamLeader"
                type="checkbox"
                defaultChecked={isCurrentTeamLeader}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="isTeamLeader" className="text-sm text-slate-600">
                Leader of the selected team
              </label>
            </div>
            <div className="col-span-2">
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Save Changes
              </button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <SectionTitle>Reset Password</SectionTitle>
          <form action={resetPassword} className="flex gap-2">
            <input type="hidden" name="userId" value={user.id} />
            <input
              name="password"
              type="password"
              placeholder="New temporary password"
              minLength={6}
              required
              className={inputClass}
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Reset
            </button>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <SectionTitle>Account Status</SectionTitle>
          {isSelf ? (
            <p className="text-sm text-slate-400">You can&apos;t deactivate your own account.</p>
          ) : (
            <form action={async () => { "use server"; await toggleUserActive(user.id, !user.active); }}>
              <button
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${
                  user.active
                    ? "border border-rose-300 text-rose-600 hover:bg-rose-50"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {user.active ? "Deactivate User" : "Activate User"}
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
