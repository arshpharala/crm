import { prisma } from "@/lib/prisma";
import { createDeal } from "../actions";
import { Card, PageHeader, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ contactId?: string }>;
}) {
  const { contactId } = await searchParams;
  const [contacts, properties] = await Promise.all([
    prisma.contact.findMany({ orderBy: { fullName: "asc" } }),
    prisma.property.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Deal" />
      <Card className="p-6">
        <form action={createDeal} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="title">Deal Title *</label>
            <input id="title" name="title" required className={inputClass} placeholder="e.g. 2BR Marina Gate - Ahmed Khan" />
          </div>

          <div>
            <label className={labelClass} htmlFor="contactId">Contact *</label>
            <select id="contactId" name="contactId" required className={inputClass} defaultValue={contactId ?? ""}>
              <option value="">Select contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="propertyId">Property</label>
            <select id="propertyId" name="propertyId" className={inputClass} defaultValue="">
              <option value="">None yet</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>{property.title} ({property.reference})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="type">Type</label>
            <select id="type" name="type" className={inputClass} defaultValue="SECONDARY">
              <option value="OFF_PLAN">Off-plan</option>
              <option value="SECONDARY">Secondary</option>
              <option value="LEASING">Leasing</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="value">Deal Value</label>
            <input id="value" name="value" type="number" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="currency">Currency</label>
            <select id="currency" name="currency" className={inputClass} defaultValue="AED">
              {["AED", "USD", "GBP", "CAD", "INR", "PKR", "NPR"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 mt-2">
            <SubmitButton>Create Deal</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
