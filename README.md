# Rentless

**Rent made simple.** Rentless connects building owners with the tenants in their rented
apartments — tracking rent, pending dues and how long each tenant has stayed, in one
mobile-first web app.

> Status: **Module 1 of 7 — Foundation** complete. See [Roadmap](#roadmap).

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript | SSR + PWA in one codebase |
| UI | Tailwind CSS v4 · shadcn/ui (Radix) · lucide-react | Fast, accessible, themeable |
| Charts | Recharts | Simple, responsive, SSR-friendly |
| Backend / DB | **Supabase** (PostgreSQL, Auth, RLS, Storage, `pg_cron`) | Relational sums + row-level isolation in the database |
| PDF | `@react-pdf/renderer` (server route handlers) | Receipts and reports without a browser |
| i18n | First-party provider (English + हिन्दी) | Zero coupling to a beta toolchain |
| PWA | Hand-written service worker + `app/manifest.ts` | Turbopack/Next-16 safe |
| Deploy | Vercel (app) + Supabase (managed backend) | |

**Why Supabase, not Firebase:** Rentless is aggregation-heavy — pending dues are
`Σcharges − Σpayments`, plus monthly/yearly rollups and rent history with effective dates.
That is a natural fit for SQL, and Row Level Security enforces "tenants see only their own
data, owners see only their own buildings" *in the database* rather than in app code.

**Where the business logic lives:** in Postgres (schema + RLS + RPC functions), wrapped by a
typed service layer in `src/lib/services/*`. A future native app talks to the same backend
(PostgREST + RPC) directly — the Next.js app is just one client.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in Supabase keys (Modules 2+)
npm run dev                    # http://localhost:3000
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (note: `next build` no longer lints in Next 16) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run icons` | Regenerate PWA PNG icons (no dependencies) |

### Supabase + Twilio setup (needed from Module 3)

1. Create a project at supabase.com → copy **Project URL** and **anon key** into `.env.local`.
2. **Authentication → Providers → Phone**: enable, choose **Twilio**, enter the Account SID,
   Auth Token and Messaging Service SID. Set an OTP rate limit.
3. Keep the **service role key** server-side only (it bypasses RLS).

---

## Project structure

```
src/
  app/
    layout.tsx              Root layout: fonts, providers, metadata, viewport
    manifest.ts             PWA web app manifest
    icon.svg                App icon (Next generates the <link>)
    (marketing)/            Public landing page (URL: /)
    (auth)/                 Login / signup shell (URL: /login, /signup)
  components/
    ui/                     shadcn/ui primitives
    layout/                 Logo, theme toggle, locale switcher
    marketing/              Landing sections
    providers/              Theme + i18n + tooltip + toaster
    shared/                 Money, StatusBadge, EmptyState, ErrorState, skeletons
    pwa/                    Service worker registration
  lib/
    constants.ts dates.ts money.ts utils.ts
    i18n/                   Locale config, cookie, messages, provider
messages/{en,hi}.json       Message catalogs
public/                     logo.svg, sw.js, offline.html, icons/
scripts/generate-icons.mjs  Dependency-free PNG icon generator
```

---

## Design system

- **Palette** — Primary **Indigo** `#4f46e5`; Success **Emerald** (paid/clear); Warning
  **Amber** (pending); Danger **Red** (overdue); Accent **Teal**. Neutrals are Slate.
  All defined as CSS variables in `globals.css` and consumed via Tailwind tokens
  (`bg-primary`, `text-success`, `border-warning`, …).
- **Logo** — a rounded tile whose roofline sits above a rupee glyph.
- **Tagline** — "Rent made simple." · "किराया, आसान भाषा में।"
- **Numbers** — amounts render with tabular digits (`.nums`) so columns line up.
- Light/dark/system theme via `next-themes`; all text in English or Hindi.

### i18n note

Translations are resolved by a client provider that reads the `rentless_locale` cookie.
Client components still SSR to the default locale (English), so the landing page is
crawlable. Because `cacheComponents` (PPR) is on, we deliberately avoid reading cookies in
the root layout. If full per-locale SEO is needed later, move to a `[locale]` route segment
(the Next.js-documented approach) and keep the same catalogs.

---

## Roadmap

| # | Module | State |
| --- | --- | --- |
| **1** | **Foundation** — scaffold, design system, i18n, PWA, landing page | ✅ done |
| 2 | Data layer — schema, migrations, RLS, services, types | ⏳ next |
| 3 | Auth & roles — phone OTP, email fallback, route guards, invites | ⏳ |
| 4 | Owner app — dashboard, buildings/flats, tenancies, payments, receipts, reports | ⏳ |
| 5 | Tenant app — home summary, history, notifications, maintenance | ⏳ |
| 6 | Jobs & reminders — monthly rent generation, overdue sweep, email/WhatsApp | ⏳ |
| 7 | Docs & ship — deploy guide, testing checklist, Android wrapping | ⏳ |

### Android later

The PWA reuses the same deployed backend two ways: **TWA** (Bubblewrap) for the lightest
wrap, or **Capacitor** if native push/camera are wanted. Either way the
`src/lib/services/*` layer talks to Supabase unchanged.
