import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

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
        action={
          <Link href="/properties/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            + New Property
          </Link>
        }
      />

      {properties.length === 0 ? (
        <EmptyState message="No properties yet." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Developer</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{property.reference}</td>
                  <td className="px-4 py-3">
                    <Link href={`/properties/${property.id}`} className="font-medium text-slate-900 hover:underline">
                      {property.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{property.category.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-600">{property.project?.developer.name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">AED {property.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge color={AVAILABILITY_COLORS[property.availability]}>{property.availability}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
