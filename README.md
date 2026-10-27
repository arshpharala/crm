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

## Phase 2 progress

- **Google Calendar sync** — done. Agents connect their Google account from Settings → Integrations; scheduling a meeting (Module 13) creates it on the agent's real Google Calendar and keeps it in sync on reschedule/cancel.

### Setting up Google Calendar integration

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (or use an existing one).
2. Enable the **Google Calendar API** (APIs & Services → Library).
3. Configure the **OAuth consent screen** (APIs & Services → OAuth consent screen). For internal testing, "External" + add your own email as a test user is fine.
4. Create credentials: APIs & Services → Credentials → Create Credentials → OAuth client ID → Application type **Web application**.
   - Authorized redirect URI: `http://localhost:3000/api/integrations/google/callback` (add your production URL's equivalent later).
5. Copy the **Client ID** and **Client Secret** into `.env`:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
6. Restart the dev server, go to **Integrations** in the sidebar, and click **Connect Google Calendar**.

## Not included yet (Phase 2+, needs external accounts/approvals)

WhatsApp Business API, cloud telephony, email sync (Gmail/Outlook), Bayut/Dubizzle/Property Finder listing sync, AI assistant, accounting module, mobile app, marketing integrations (Meta/Google Ads). These require real API credentials and should be wired in incrementally — the data model already has the right hooks (e.g. `Lead.source`, `Activity.type`) to plug adapters in without restructuring.

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
