import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { Badge, Card, EmptyState, LinkButton, PageHeader, PersonChip, Td, Th, TableShell } from "@/components/ui";
import { PlusIcon, UserIcon } from "@/components/icons";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user || !canManageUsers(session.user.role)) {
    return (
      <div>
        <PageHeader title="Users" />
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">
            You don&apos;t have permission to manage users. This is restricted to Super Admin, Managing
            Director, Sales Director, CRM Admin and HR/Operations roles.
          </p>
        </Card>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { team: true },
  });

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} accounts`}
        action={
          <LinkButton href="/users/new">
            <PlusIcon size={16} /> New User
          </LinkButton>
        }
      />

      {users.length === 0 ? (
        <EmptyState message="No users yet." icon={<UserIcon size={28} />} />
      ) : (
        <TableShell>
          <thead className="border-b border-slate-100">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Team</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80">
                <Td>
                  <Link href={`/users/${user.id}`}>
                    <PersonChip name={user.name} />
                  </Link>
                </Td>
                <Td className="text-slate-600">{user.email}</Td>
                <Td className="text-slate-600">{user.role.replaceAll("_", " ")}</Td>
                <Td className="text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    {user.team?.name ?? "-"}
                    {user.team?.leaderId === user.id && <Badge color="indigo" dot>Leader</Badge>}
                  </span>
                </Td>
                <Td>
                  <Badge color={user.active ? "green" : "slate"} dot>{user.active ? "Active" : "Inactive"}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
