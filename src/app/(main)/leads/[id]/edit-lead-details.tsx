"use client";

import { useActionState, useEffect } from "react";
import { updateLeadDetails } from "../actions";
import { inputClass, labelClass } from "@/components/ui";

type Props = {
  lead: {
    id: string;
    phone: string;
    email: string | null;
    country: string | null;
    propertyInterest: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    purpose: string | null;
  };
};

const initialState = { error: null, success: false };

const CURRENCIES = ["AED", "USD", "GBP", "CAD", "INR", "PKR", "NPR"];
const PURPOSES = [
  { value: "", label: "-" },
  { value: "SELF_USE", label: "Self use" },
  { value: "RENTAL_INCOME", label: "Rental income" },
  { value: "CAPITAL_APPRECIATION", label: "Capital appreciation" },
  { value: "RELOCATION", label: "Relocation" },
  { value: "RESALE", label: "Resale" },
];

export function EditLeadDetails({ lead }: Props) {
  const [state, formAction, pending] = useActionState(updateLeadDetails, initialState);

  // Auto-dismiss success after 3 s
  useEffect(() => {
    // intentionally no cleanup needed — state is reset on next action call
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="leadId" value={lead.id} />

      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Lead details updated successfully.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="phone">Phone *</label>
          <input
            id="phone"
            name="phone"
            required
            defaultValue={lead.phone}
            className={inputClass}
            placeholder="+971 5xx xxx xxx"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={lead.email ?? ""}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass} htmlFor="country">Country of Residence</label>
          <input
            id="country"
            name="country"
            defaultValue={lead.country ?? ""}
            className={inputClass}
            placeholder="UAE, UK, USA..."
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass} htmlFor="propertyInterest">Property / Project of Interest</label>
          <input
            id="propertyInterest"
            name="propertyInterest"
            defaultValue={lead.propertyInterest ?? ""}
            className={inputClass}
            placeholder="e.g. Downtown Dubai, 2BR apartment"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="budgetMin">Budget Min</label>
          <input
            id="budgetMin"
            name="budgetMin"
            type="number"
            defaultValue={lead.budgetMin ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="budgetMax">Budget Max</label>
          <input
            id="budgetMax"
            name="budgetMax"
            type="number"
            defaultValue={lead.budgetMax ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="currency">Currency</label>
          <select id="currency" name="currency" defaultValue={lead.currency} className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="purpose">Investment Purpose</label>
          <select id="purpose" name="purpose" defaultValue={lead.purpose ?? ""} className={inputClass}>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

