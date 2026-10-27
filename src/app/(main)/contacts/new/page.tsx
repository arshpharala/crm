import { createContact } from "../actions";
import { Card, PageHeader, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New Contact" />
      <Card className="p-6">
        <form action={createContact} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="fullName">Full Name *</label>
            <input id="fullName" name="fullName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone *</label>
            <input id="phone" name="phone" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="country">Country</label>
            <input id="country" name="country" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="preferredLanguage">Preferred Language</label>
            <input id="preferredLanguage" name="preferredLanguage" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="currency">Currency</label>
            <select id="currency" name="currency" className={inputClass} defaultValue="AED">
              {["AED", "USD", "GBP", "CAD", "INR", "PKR", "NPR"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="budgetMin">Budget Min</label>
            <input id="budgetMin" name="budgetMin" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="budgetMax">Budget Max</label>
            <input id="budgetMax" name="budgetMax" type="number" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="propertyPreferences">Property Preferences</label>
            <input id="propertyPreferences" name="propertyPreferences" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" className={inputClass} rows={3} />
          </div>
          <div className="col-span-2 mt-2">
            <SubmitButton>Create Contact</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
