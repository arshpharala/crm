"use client";

import { useActionState } from "react";
import { createLead } from "../actions";
import { Card, PageHeader, inputClass, labelClass } from "@/components/ui";

type Agent = { id: string; name: string; role: string };

const initialState = { error: null };

export function NewLeadForm({ agents }: { agents: Agent[] }) {
  const [state, formAction, pending] = useActionState(createLead, initialState);

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Lead" />
      <Card className="p-6">
        {state?.error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        )}
        <form action={formAction} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="fullName">Full Name *</label>
            <input id="fullName" name="fullName" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="phone">Phone *</label>
            <input id="phone" name="phone" required className={inputClass} placeholder="+971 5xx xxx xxx" />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="country">Country of Residence</label>
            <input id="country" name="country" className={inputClass} placeholder="UAE, UK, USA, Canada, India..." />
          </div>
          <div>
            <label className={labelClass} htmlFor="preferredLanguage">Preferred Language</label>
            <input id="preferredLanguage" name="preferredLanguage" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="source">Lead Source</label>
            <select id="source" name="source" className={inputClass} defaultValue="MANUAL">
              {[
                "WEBSITE", "LANDING_PAGE", "GOOGLE_ADS", "META_ADS", "WHATSAPP", "EMAIL",
                "BAYUT", "DUBIZZLE", "PROPERTY_FINDER", "GOOGLE_BUSINESS", "LINKEDIN",
                "QR_CODE", "REFERRAL", "WALK_IN", "PHONE_CALL", "EXHIBITION",
                "DEVELOPER_EVENT", "MANUAL", "CSV_IMPORT", "THIRD_PARTY", "API_WEBHOOK", "OTHER",
              ].map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="temperature">Temperature</label>
            <select id="temperature" name="temperature" className={inputClass} defaultValue="WARM">
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="propertyInterest">Property / Project of Interest</label>
            <input id="propertyInterest" name="propertyInterest" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="budgetMin">Budget Min</label>
            <input id="budgetMin" name="budgetMin" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="budgetMax">Budget Max</label>
            <input id="budgetMax" name="budgetMax" type="number" className={inputClass} />
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
            <label className={labelClass} htmlFor="purpose">Investment Purpose</label>
            <select id="purpose" name="purpose" className={inputClass} defaultValue="">
              <option value="">-</option>
              <option value="SELF_USE">Self use</option>
              <option value="RENTAL_INCOME">Rental income</option>
              <option value="CAPITAL_APPRECIATION">Capital appreciation</option>
              <option value="RELOCATION">Relocation</option>
              <option value="RESALE">Resale</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="assignedAgentId">Assign To</label>
            <select id="assignedAgentId" name="assignedAgentId" className={inputClass} defaultValue="">
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role.replaceAll("_", " ")})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 mt-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving…" : "Create Lead"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

