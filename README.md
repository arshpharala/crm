# BIG B Properties — Real Estate CRM

Phase 1 core CRM for BIG B Real Estate LLC (Dubai), built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite (swap to PostgreSQL for production via `DATABASE_URL`)
- NextAuth v5 (credentials-based auth, JWT sessions)

## What's included (Phase 1)

- Role-based auth (15 roles: Super Admin, Sales Director/Manager, Team Leader, Agent, CRM Admin, Listing Admin, Marketing Manager, Telecaller, Finance, HR/Operations, Referral Partner, Developer Relationship Manager, Auditor)
- Leads: full lifecycle (23 stages), sources, scoring, temperature, assignment, activity timeline, conversion to Contact
- Contacts/Investors: international fields (country, currency, language), linked deals and activity
- Developers & Projects: developer profiles, project inventory feeds
- Property inventory: off-plan/secondary/leasing, availability tracking
- Deals pipeline: off-plan/secondary/leasing transaction stages, commission fields
- Tasks & follow-ups: priorities, due dates, overdue tracking
- Executive dashboard: key CRM metrics

## Not included yet (Phase 2+, needs external accounts/approvals)

WhatsApp Business API, cloud telephony, email sync (Google Workspace/Microsoft 365), Bayut/Dubizzle/Property Finder listing sync, AI assistant, accounting module, mobile app, marketing integrations (Meta/Google Ads). These require real API credentials and should be wired in incrementally — the data model already has the right hooks (e.g. `Lead.source`, `Activity.type`) to plug adapters in without restructuring.

## Getting started

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` and sign in with:

- `admin@bigbproperties.ae` / `admin123` (Super Admin)
- `sales.manager@bigbproperties.ae` / `admin123`
- `agent1@bigbproperties.ae` / `admin123`
- `agent2@bigbproperties.ae` / `admin123`
- `finance@bigbproperties.ae` / `admin123`

## Environment variables

See `.env` (not committed). Required:

- `DATABASE_URL` — Prisma connection string (SQLite by default)
- `AUTH_SECRET` — NextAuth JWT signing secret (generate a long random string for production)
- `NEXTAUTH_URL` — base URL of the app

## Useful scripts

- `npm run dev` — start dev server
- `npm run build` / `npm run start` — production build/run
- `npm run db:seed` — reseed demo data
- `npm run db:studio` — open Prisma Studio to browse the database
