import { createDeveloper } from "../actions";
import { Card, PageHeader, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default function NewDeveloperPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New Developer" />
      <Card className="p-6">
        <form action={createDeveloper} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="name">Developer Name *</label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="website">Website</label>
            <input id="website" name="website" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="contactDetails">Contact Details</label>
            <input id="contactDetails" name="contactDetails" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="registrationStatus">Registration Status</label>
            <input id="registrationStatus" name="registrationStatus" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="commissionTerms">Commission Terms</label>
            <input id="commissionTerms" name="commissionTerms" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" className={inputClass} rows={3} />
          </div>
          <div className="col-span-2 mt-2">
            <SubmitButton>Create Developer</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
