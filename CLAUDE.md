# FreeFinder — Project Reference

FreeFinder is a mobile-first web app that connects people who want to give away free items with people nearby looking for them. Target users are two sides of the same local exchange: people decluttering/giving items away, and people browsing for free items near them. The core experience is a full-screen map of nearby free listings, with posting, reviews, and direct messaging between posters and interested users.

This file is a stable reference — tech stack, commands, structure, conventions, and hard rules. For feature status, known bugs, and what's being worked on, see `CHANGELOG.md`.

## Tech stack

- **Next.js 16.2.9** (App Router)
- **React 19.2.4** / **react-dom 19.2.4**
- **TypeScript ^5**, mixed with plain JS — most routes/components are still `.jsx`/`.js`; a handful (`app/layout.tsx`, `app/login/page.tsx`, `components/login-form.tsx`, `components/ui/button.tsx`, `lib/utils.ts`) are `.tsx`/`.ts`. This is an in-progress migration, not a mistake — new files can be written in either, but don't be surprised by the mix.
- **Tailwind CSS ^4**
- **Supabase** (`@supabase/supabase-js` ^2.108.2) — Postgres, Auth, Storage, Realtime. See `docs/database_schema.md` for the schema.
- **Mapbox GL JS** (`mapbox-gl` ^3.25.0, `@types/mapbox-gl` ^3.4.1)
- **shadcn/ui** — style `"base-nova"`, built on `@base-ui/react` ^1.5.0, **not Radix**. Don't assume classic Radix-based shadcn docs/examples apply directly. Currently only used on `/login` (`components/login-form.tsx`, `components/ui/button.tsx`); the rest of the app uses plain Tailwind utilities, not the shadcn oklch design tokens.
- Supporting libs: `lucide-react` (icons), `clsx` + `tailwind-merge` (via `cn()` in `lib/utils.ts`), `class-variance-authority`.

## Key commands

- `npm install` — install dependencies
- `npm run dev` — run locally (`next dev`, Turbopack)
- `npm run build` — production build (`next build`)
- `npm run start` — run the production build (`next start`)
- `npm run lint` — ESLint (`eslint-config-next`, flat config in `eslint.config.mjs`)
- **Deploy**: no deploy pipeline is configured in this repo yet (no `vercel.json`, no CI config). `.vercel` is gitignored, implying Vercel is the likely intended target, but nothing is set up — don't assume a deploy step exists.
- **Dev database seed**: `node --env-file=.env.local scripts/seed.js` — seeds 8 users, 20 listings, photos, and reviews around Orlando, FL. Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Not idempotent (re-running fails loudly on duplicate emails rather than double-seeding). Only ever point it at a dev/test Supabase project.

### Environment variables (`.env.local`, not committed)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side Supabase access
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox access token
- `SUPABASE_SERVICE_ROLE_KEY` — **scripts only**, see Hard Rules below

## Folder structure

- `app/` — Next.js App Router routes: `/` (home/map), `/login`, `/register`, `/post`, `/listings`, `/listings/[id]`, `/profile`, `/messages`, plus root `layout.tsx` and `globals.css`.
- `components/` — organized by feature:
  - `layout/` — `Navbar.jsx` (site nav, hides itself on `/`). `Header.jsx` and `Layout.jsx` also live here but are **dead code** — not imported anywhere; candidates for removal rather than patterns to follow.
  - `map/` — `MapContainer.jsx`, the Mapbox map itself.
  - `filters/` — `FilterSidebar.jsx`, the filter bottom-sheet.
  - `listings/` — `ListingCard.jsx`.
  - `post/` — `ImageUpload.jsx`.
  - `reviews/` — `ReviewForm.jsx`, `ReviewList.jsx`.
  - `messaging/` — `MessageButton.jsx` (currently unused — see `CHANGELOG.md`).
  - `ui/` — shadcn primitives (currently just `button.tsx`).
  - `login-form.tsx` — top-level, not namespaced (shadcn-generated).
- `context/` — `AuthContext.js`, the `AuthProvider`/`useAuth()` Supabase session context.
- `lib/` — `supabaseClient.js` (the shared Supabase client singleton), `utils.ts` (`cn()` for Tailwind class merging).
- `scripts/` — dev-only tooling, not part of the deployed app. Currently just `seed.js`.
- `docs/` — `database_schema.md`, the Postgres schema and RLS reference.
- `public/` — static assets.

## Coding conventions

- Add `'use client'` to any component that uses hooks, event handlers, or browser APIs (see Hard Rules).
- Access Supabase through the shared client in `lib/supabaseClient.js` — don't instantiate a new client elsewhere in app code.
- Read auth/session state via `useAuth()` from `context/AuthContext.js`. A couple of existing files (e.g. `MessageButton.jsx`, `app/listings/[id]/page.jsx`) call `supabase.auth.getUser()` directly instead — that's an inconsistency to converge on `useAuth()`, not the pattern to copy.
- Styling is plain Tailwind utility classes (`bg-gray-50`, etc.) everywhere except the shadcn-sourced `/login` page, which uses the oklch design-token classes (`bg-primary`, `text-foreground`). Don't mix the two systems in the same component.
- Listing categories are the fixed, **Title-Case** strings `'Furniture'`, `'Clothing'`, `'Electronics'`, `'Books'`, `'Other'` (defined in `app/post/page.jsx` and mirrored in `components/filters/FilterSidebar.jsx`). Any new category UI must match these exactly — a lowercase or differently-cased set will silently fail to match real data.

## Design system

Flat Design. This is the canonical visual spec for FreeFinder going forward:

- **Background**: `#FFFFFF` white canvas
- **Primary color**: `#10B981` emerald green (replaces blue from the base system)
- **Text**: `#111827` sharp dark gray
- **Cards**: solid white, `rounded-lg`, `shadow-sm` — subtle shadow only on listing cards
- **Buttons**: solid color fill, `rounded-md`, scale on hover, no shadows
- **Inputs**: `gray-100` background, no border, blue border on focus
- **No** gradients, no blur effects, no decorative textures
- **Typography**: bold, using the Outfit font
- **Layout**: clean, geometric, generous whitespace
- **Overall feel**: clean, fast, trustworthy marketplace

**Known gap**: the app does not conform to this yet. Today it uses Tailwind's `green-600` (not `#10B981`), the Geist font (not Outfit), `gray-300`-bordered inputs (not borderless `gray-100`), and the shadcn `/login` page has its own separate oklch token theme. Migrating the UI to this spec is tracked as a to-do in `CHANGELOG.md`, not something already done — don't assume existing components match it just because it's documented here.

## Removed features — do not re-add

- **Likes on listings**: intentionally removed as a product decision (2026-08-04). There is no `likes` table, no like button, and no like count anywhere in this app. Don't reintroduce liking/unliking listings without a new, explicit product decision — see `CHANGELOG.md` for what was removed and why.

## Hard rules

1. **Never commit `.env.local`.** It's covered by the `.env*` pattern in `.gitignore` — don't override that per-file, and don't paste its contents into commits, code, or docs.
2. **Always create a branch before building a feature.** Don't commit new feature work directly to `main`.
3. **Always add `'use client'`** to any component that uses React hooks (`useState`, `useEffect`, etc.) or browser-only APIs — omitting it is a recurring source of production build failures in this project's history.
4. **The Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) is for scripts only** (e.g. `scripts/seed.js`) — never reference it in `app/`, `components/`, or `lib/`, and never prefix it `NEXT_PUBLIC_` (that would bundle it into client-side JS and expose it publicly).
