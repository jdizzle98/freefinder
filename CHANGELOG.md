# FreeFinder Changelog

Living record of what's been built, where it stands, and what's next. For stable project facts (stack, structure, conventions, hard rules), see `CLAUDE.md`.

## Features built, by branch

### `main`
- Auth: login, register, sign-out (`app/login`, `app/register`, `AuthContext`)
- Post a listing: title/description/category/photos, uploads to Supabase Storage (`app/post`)
- Listings grid (`app/listings`) and listing detail page (`app/listings/[id]`)
- Reviews: write a review and view the list on a listing's detail page
- Home screen (`/`): full-screen map with floating search bar and bottom nav, filter bottom-sheet (distance/category/time-posted), Navbar hidden on this route only
- `AuthProvider` wired into the root layout

### `post_listing_view` (unmerged — 5 commits ahead of `main` as of 2026-08-04)
- Pastel, category-colored map pins (custom Mapbox markers) with a tap-to-open card, replacing the plain blue circle-layer markers still on `main`
- Real geolocation capture when posting a listing, replacing a hardcoded `latitude = 0, longitude = 0` placeholder
- `mapbox-gl.css` import fix for pins drifting instead of staying anchored
- Dev seed script (`scripts/seed.js`)

## Removed features

- **Likes on listings** (removed 2026-08-04, product decision): previously partially implemented — a working like/unlike toggle on the listing detail page, but a non-functional stub on the listings-grid card. Removed everywhere: the `likes` table and its RLS/index entries from `docs/database_schema.md`, the like button/count from `ListingCard.jsx` and the detail page, the `likes` join from both listing queries, the `like_count` popup field from the map, the "Likes Received" profile stat, the seed script's fake-like generation, and the README mentions. See `CLAUDE.md` → "Removed features" for the standing rule against re-adding it. **Not done**: the live `likes` table in the Supabase project itself was not dropped — that's a manual follow-up in the Supabase dashboard if desired.

## Feature status

| Feature | Status | Notes |
|---|---|---|
| Auth (login/register/sign-out) | Working | |
| Posting a listing | Working | Real geolocation only on `post_listing_view`; `main` still needs the fix |
| Map view + filters | Working | |
| Listing detail page | Working, with a gap | "Message Poster" is a stub `alert()`, not wired to real messaging |
| Reviews | Partially working | Submitting works, but the list doesn't auto-refresh — `ReviewForm` calls `onSubmit()` while the prop it's actually passed is `onReviewSubmit` (name mismatch) |
| Messaging | Partially working | Conversations are created and listed with a live realtime subscription, but there's no way to open a conversation or send a message — the thread view and send button are static placeholders. `MessageButton.jsx` (which does create conversations correctly) is dead code, never imported anywhere |
| Profile | Partially working | Viewing your own listings works; "Edit Profile" is a stub `alert()`; "Reviews Given" stat is hardcoded to `0`, not computed |
| `/forgot-password` | Not started | Linked from the login form; the route doesn't exist |
| "Remember me" (login) | Not started | Present in the UI, not wired to anything |

## Known bugs/issues

- `ReviewForm` prop-name mismatch means the review list doesn't refresh after submitting (see Reviews above)
- `MessageButton.jsx`, `components/layout/Header.jsx`, and `components/layout/Layout.jsx` are dead code — not imported anywhere
- A vim swap file (`app/profile/.page.jsx.swp`) was accidentally committed to git on `post_listing_view`; a local deletion of it is currently sitting uncommitted on that branch
- The 3 earliest seeded listings are permanently stuck at `latitude=0, longitude=0` ("Null Island") — this predates the geolocation fix on `post_listing_view` and was never backfilled
- Mapbox's "missing CSS declarations" console warning can still appear transiently in `next dev` even with the CSS import fix in place — a known dev-mode timing quirk, not evidence the fix didn't take

## Next up (suggested priority order)

1. Wire real messaging — open a conversation, send/receive messages. The most visibly half-built feature.
2. Fix the `ReviewForm` `onSubmit`/`onReviewSubmit` prop mismatch.
3. Merge `post_listing_view` into `main` (pastel pins, real geolocation, mapbox CSS fix).
4. Build `/forgot-password` or remove the dangling link from the login form.
5. Compute the real "Reviews Given" profile stat and build Edit Profile.
6. Remove remaining dead code: `MessageButton.jsx` (unless adopted for #1), `Header.jsx`, `Layout.jsx`, the stray `.swp` file.
7. Optionally drop the now-unused `likes` table from the live Supabase project.
8. Migrate the UI to the Flat Design system now recorded in `CLAUDE.md` (emerald `#10B981` primary, Outfit font, borderless `gray-100` inputs) — currently still on Tailwind `green-600` and the Geist font.
