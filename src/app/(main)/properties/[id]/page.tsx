import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, SectionTitle, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { updatePropertyAvailability } from "../actions";

const STAGE_COLORS: Record<string, string> = { CLOSED_WON: "green", CLOSED_LOST: "red" };

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
        <PageHeader title={property.title} subtitle={property.reference} />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Category</p><p className="font-medium text-slate-900">{property.category.replaceAll("_", " ")}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Location</p><p className="font-medium text-slate-900">{property.area ?? "-"}, {property.emirate ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Building</p><p className="font-medium text-slate-900">{property.building ?? "-"} {property.unitNumber ?? ""}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Bed / Bath</p><p className="font-medium text-slate-900">{property.bedrooms ?? "-"} / {property.bathrooms ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Built-up Area</p><p className="font-medium text-slate-900">{property.builtUpArea ?? "-"} sqft</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Price</p><p className="text-base font-semibold text-slate-900">AED {property.price.toLocaleString()}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Developer</p><p className="font-medium text-slate-900">{property.project?.developer.name ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Listing Agent</p><p className="font-medium text-slate-900">{property.listingAgent?.name ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Payment Plan</p><p className="font-medium text-slate-900">{property.paymentPlan ?? "-"}</p></div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Linked Deals</SectionTitle>
          {property.deals.length === 0 ? (
            <p className="text-sm text-slate-400">No deals linked to this property yet.</p>
          ) : (
            <div className="space-y-2">
              {property.deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm">
                  <span>{deal.contact.fullName} · {deal.title}</span>
                  <Badge color={STAGE_COLORS[deal.stage] ?? "slate"}>{deal.stage.replaceAll("_", " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <SectionTitle>Availability</SectionTitle>
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
