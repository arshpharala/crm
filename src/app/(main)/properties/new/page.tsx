import { prisma } from "@/lib/prisma";
import { createProperty } from "../actions";
import { Card, PageHeader, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default async function NewPropertyPage() {
  const projects = await prisma.project.findMany({ include: { developer: true }, orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Property" />
      <Card className="p-6">
        <form action={createProperty} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="reference">Listing Reference *</label>
            <input id="reference" name="reference" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="title">Title *</label>
            <input id="title" name="title" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="category">Category</label>
            <select id="category" name="category" className={inputClass} defaultValue="SECONDARY_SALE">
              <option value="OFF_PLAN">Off-plan</option>
              <option value="SECONDARY_SALE">Secondary sale</option>
              <option value="LEASING_RESIDENTIAL">Leasing (residential)</option>
              <option value="LEASING_COMMERCIAL">Leasing (commercial)</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="projectId">Project (if off-plan)</label>
            <select id="projectId" name="projectId" className={inputClass} defaultValue="">
              <option value="">Standalone / secondary</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.developer.name} - {project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="emirate">Emirate</label>
            <input id="emirate" name="emirate" className={inputClass} defaultValue="Dubai" />
          </div>
          <div>
            <label className={labelClass} htmlFor="area">Area / Community</label>
            <input id="area" name="area" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="building">Building</label>
            <input id="building" name="building" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="unitNumber">Unit Number</label>
            <input id="unitNumber" name="unitNumber" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="bedrooms">Bedrooms</label>
            <input id="bedrooms" name="bedrooms" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="bathrooms">Bathrooms</label>
            <input id="bathrooms" name="bathrooms" type="number" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="builtUpArea">Built-up Area (sqft)</label>
            <input id="builtUpArea" name="builtUpArea" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="price">Price (AED) *</label>
            <input id="price" name="price" type="number" required className={inputClass} />
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="paymentPlan">Payment Plan</label>
            <input id="paymentPlan" name="paymentPlan" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="availability">Availability</label>
            <select id="availability" name="availability" className={inputClass} defaultValue="AVAILABLE">
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="OFF_MARKET">Off market</option>
            </select>
          </div>

          <div className="col-span-2 mt-2">
            <SubmitButton>Create Property</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
