import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState, LinkButton, PageHeader, PersonChip, Td, Th, TableShell } from "@/components/ui";
import { PlusIcon, UserIcon } from "@/components/icons";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    include: { deals: true },
  });

  return (
    <div>
      <PageHeader
        title="Contacts & Investors"
        subtitle={`${contacts.length} total`}
        action={
          <LinkButton href="/contacts/new">
            <PlusIcon size={16} /> New Contact
          </LinkButton>
        }
      />

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet." icon={<UserIcon size={28} />} />
      ) : (
        <TableShell>
          <thead className="border-b border-slate-100">
            <tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Country</Th>
              <Th>Currency</Th>
              <Th>Open Deals</Th>
              <Th>Lifetime Value</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50/80">
                <Td>
                  <Link href={`/contacts/${contact.id}`}>
                    <PersonChip name={contact.fullName} />
                  </Link>
                </Td>
                <Td className="text-slate-600">{contact.phone}</Td>
                <Td className="text-slate-600">{contact.country ?? "-"}</Td>
                <Td className="text-slate-600">{contact.currency}</Td>
                <Td className="text-slate-600">{contact.deals.length}</Td>
                <Td className="font-medium text-slate-900">{contact.currency} {contact.lifetimeValue.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
