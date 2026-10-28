"use client";

import { useActionState } from "react";
import Link from "next/link";
import { findMatchingProperties } from "../ai-actions";
import { Badge } from "@/components/ui";
import { SparkleIcon } from "@/components/icons";

const initialState = { matches: [], error: null };

export function AIMatchPanel({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(findMatchingProperties, initialState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="leadId" value={leadId} />
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SparkleIcon size={15} />
          {pending ? "Finding matches..." : "Find Matching Properties"}
        </button>
      </form>

      {state.error && <p className="mt-3 text-sm text-rose-600">{state.error}</p>}

      {state.matches.length === 0 && !state.error && !pending && (
        <p className="mt-3 text-xs text-slate-400">AI-suggested property matches will appear here.</p>
      )}

      {state.matches.length > 0 && (
        <div className="mt-3 space-y-2">
          {state.matches.map((m) => (
            <Link
              key={m.propertyId}
              href={`/properties/${m.propertyId}`}
              className="block rounded-lg border border-slate-100 p-3 text-sm hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">{m.title}</span>
                <Badge color="indigo">{m.score}% match</Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {m.community ?? "-"} · AED {m.price.toLocaleString()} · {m.bedrooms != null ? `${m.bedrooms}BR` : "-"}
              </p>
              <p className="mt-1.5 text-xs text-slate-600">{m.reason}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
