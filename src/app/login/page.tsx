"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { inputClass, labelClass } from "@/components/ui";
import { Building2Icon } from "@/components/icons";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Building2Icon size={18} />
          </div>
          <span className="text-lg font-semibold text-white">BIG B Properties</span>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-3xl font-semibold leading-tight text-white">
            The operating system for your real estate business.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Leads, pipeline, properties, meetings and client conversations — one source of truth
            for every agent, team lead and manager.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">Dubai · UAE · International Investors</p>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Building2Icon size={18} />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">BIG B Properties</h1>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your CRM workspace</p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className={inputClass} />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500">
            Demo: <span className="font-medium text-slate-700">admin@bigbproperties.ae</span> / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
