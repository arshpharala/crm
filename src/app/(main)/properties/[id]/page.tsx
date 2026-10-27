import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { updatePropertyAvailability } from "../actions";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { project: { include: { developer: true } }, listingAgent: true, deals: { include: { contact: true } } },
  });

  if (!property) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader title={property.title} />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Reference:</span> <span className="font-medium">{property.reference}</span></div>
            <div><span className="text-slate-500">Category:</span> <span className="font-medium">{property.category.replaceAll("_", " ")}</span></div>
            <div><span className="text-slate-500">Location:</span> <span className="font-medium">{property.area ?? "-"}, {property.emirate ?? "-"}</span></div>
            <div><span className="text-slate-500">Building:</span> <span className="font-medium">{property.building ?? "-"} {property.unitNumber ?? ""}</span></div>
            <div><span className="text-slate-500">Bed / Bath:</span> <span className="font-medium">{property.bedrooms ?? "-"} / {property.bathrooms ?? "-"}</span></div>
            <div><span className="text-slate-500">Built-up Area:</span> <span className="font-medium">{property.builtUpArea ?? "-"} sqft</span></div>
            <div><span className="text-slate-500">Price:</span> <span className="font-medium">AED {property.price.toLocaleString()}</span></div>
            <div><span className="text-slate-500">Developer:</span> <span className="font-medium">{property.project?.developer.name ?? "-"}</span></div>
            <div><span className="text-slate-500">Listing Agent:</span> <span className="font-medium">{property.listingAgent?.name ?? "-"}</span></div>
            <div><span className="text-slate-500">Payment Plan:</span> <span className="font-medium">{property.paymentPlan ?? "-"}</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Linked Deals</h2>
          {property.deals.length === 0 ? (
            <p className="text-sm text-slate-400">No deals linked to this property yet.</p>
          ) : (
            <div className="space-y-2">
              {property.deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                  <span>{deal.contact.fullName} · {deal.title}</span>
                  <Badge>{deal.stage.replaceAll("_", " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Availability</h2>
          <form action={async (formData) => { "use server"; await updatePropertyAvailability(property.id, formData.get("availability") as never); }}>
            <AutoSubmitSelect name="availability" defaultValue={property.availability} className={inputClass}>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="OFF_MARKET">Off market</option>
            </AutoSubmitSelect>
          </form>
        </Card>
      </div>
    </div>
  );
}
