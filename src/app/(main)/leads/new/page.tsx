import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { assignableAgentsWhere } from "@/lib/permissions";
import { NewLeadForm } from "./new-lead-form";

export default async function NewLeadPage() {
  const session = await auth();
  const sessionUser = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, teamId: true } })
    : null;

  const agents = await prisma.user.findMany({
    where: sessionUser ? assignableAgentsWhere(sessionUser) : { active: true },
    orderBy: { name: "asc" },
  });
  return <NewLeadForm agents={agents} />;
}
