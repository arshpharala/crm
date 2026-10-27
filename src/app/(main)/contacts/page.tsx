import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    include: { deals: true },
  });

  return (
    <div>
      <PageHeader
        title="Contacts & Investors"
        action={
          <Link href="/contacts/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            + New Contact
          </Link>
        }
      />

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Open Deals</th>
                <th className="px-4 py-3">Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="font-medium text-slate-900 hover:underline">
                      {contact.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{contact.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{contact.country ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{contact.currency}</td>
                  <td className="px-4 py-3 text-slate-600">{contact.deals.length}</td>
                  <td className="px-4 py-3 text-slate-600">{contact.currency} {contact.lifetimeValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
