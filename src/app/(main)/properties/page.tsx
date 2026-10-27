import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, LinkButton, PageHeader, Td, Th, TableShell } from "@/components/ui";
import { BuildingIcon, PlusIcon } from "@/components/icons";

const AVAILABILITY_COLORS: Record<string, string> = {
  AVAILABLE: "green",
  RESERVED: "amber",
  SOLD: "red",
  RENTED: "blue",
  OFF_MARKET: "slate",
};

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { include: { developer: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Property Inventory"
        subtitle={`${properties.length} listings`}
        action={
          <LinkButton href="/properties/new">
            <PlusIcon size={16} /> New Property
          </LinkButton>
        }
      />

      {properties.length === 0 ? (
        <EmptyState message="No properties yet." icon={<BuildingIcon size={28} />} />
      ) : (
        <TableShell>
          <thead className="border-b border-slate-100">
            <tr>
              <Th>Reference</Th>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Developer</Th>
              <Th>Price</Th>
              <Th>Availability</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-slate-50/80">
                <Td className="text-slate-500">{property.reference}</Td>
                <Td>
                  <Link href={`/properties/${property.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {property.title}
                  </Link>
                </Td>
                <Td className="text-slate-600">{property.category.replaceAll("_", " ")}</Td>
                <Td className="text-slate-600">{property.project?.developer.name ?? "-"}</Td>
                <Td className="font-medium text-slate-900">AED {property.price.toLocaleString()}</Td>
                <Td><Badge color={AVAILABILITY_COLORS[property.availability]} dot>{property.availability}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
