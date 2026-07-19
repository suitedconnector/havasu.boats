# havasu.boats

Static-generated boat directory for the Lake Havasu region, built to be **build-and-forget** at launch: no backend, no database, no accounts. Sourced from an Outscraper Google Maps export via a normalization script, deployed as fully-static HTML.

## Stack

- **Next.js 15 (App Router)** — SSG via `generateStaticParams`
- **React 19**, **TypeScript** (strict, errors NOT suppressed)
- **Tailwind CSS**
- **Vercel** (recommended host)
- **Python 3** — normalization script only, not a runtime dep

## Architecture

```
scripts/build-listings.py     Outscraper CSV → clean listings.json
data/listings.json            The static data every page renders from
data/review.json              Rows flagged for your manual review
data/source.csv               Your latest Outscraper export (gitignored)

app/                          Next.js pages
  page.tsx                    Home
  [category]/page.tsx         /rentals, /dealers, /marinas (dynamic route,
                              statically generated per launch category)
  listing/[slug]/page.tsx     One page per listing (statically generated)
  sitemap.ts                  Programmatic sitemap, always in sync with data
  robots.ts

lib/
  types.ts                    Listing schema (mirrors what the Python emits)
  listings.ts                 Data accessors (getListingsByService, etc.)
  constants.ts                Brand + category + town config
```

The whole site regenerates from `data/listings.json` at build time. There is no runtime database.

## Data workflow

The build-time data source is a Google Sheet you export as CSV. To refresh:

1. Update the sheet (e.g. add/edit listings, or re-run Outscraper for new queries).
2. Export the sheet: File → Download → Comma Separated Values → save as `data/source.csv`.
3. Run the normalization: `npm run build:data`.
4. Review `data/review.json` for anything the classifier wasn't sure about.
5. Commit `data/listings.json` and push. Vercel rebuilds and redeploys automatically.

You never edit `listings.json` by hand. It's a build artifact.

## Local development

```bash
npm install
npm run build:data      # generates data/listings.json from data/source.csv
npm run dev             # http://localhost:3000
```

To produce a production build:

```bash
npm run build           # runs next build; every listing pre-renders
npm start
```

## Design intent

- Palette derived from the subject: **channel-water blue** (`#0B4A6F`), **sandbar tan** (`#EDD9A8`), **rock red** (`#B93C1E`), **buoy yellow** (`#F4B000`). Deliberately not the AI-default cream+serif+terracotta look.
- Type: **Bricolage Grotesque** display / **Inter** body / **JetBrains Mono** for the nautical-chart coordinate labels.
- Signature element: every listing shows a chart-style eyebrow (`34°29'21"N 114°20'54"W · Lake Havasu City · Boat Rentals`) — only possible because Outscraper gives us real lat/lng.

## Category launch scope

**Live at launch:** Rentals, Dealers, Marinas.

**Imported but dormant:** Dry storage, lot storage, tours, repair, retail. These listings are in `listings.json` but `isActive: false`, so no category page renders and they don't appear in the sitemap. To turn one on: add it to `LAUNCH_CATEGORIES` in `lib/constants.ts` and flip the affected rows' `isActive` (or re-run the normalization with the updated launch set).

## Monetization (deferred, by design)

The site has zero backend at launch. When you're ready to monetize:

- **Featured listings**: flip `isFeatured: true` in `data/listings.json`. The card and listing page already handle the badge. Selling is offline.
- **Lead capture**: the `<LeadForm>` currently logs to console. Wire its handler to a Resend endpoint (or a Vercel function) to route inquiries.
- **Tracked phone / accounts / auth**: not built. Add only when paying-customer volume justifies it. Neon + next-auth is the migration path (see `haulagua` for a working reference).

## What's NOT here

- No accounts, no login, no dashboard.
- No lead-form backend (the form is UI only until you wire it).
- No payment integration.
- No town-crossed pages yet (e.g. `/rentals/parker`) — the data supports it, add later if traffic/demand shows.

## Data provenance

Business data comes from Outscraper Google Maps exports. Listings unclaimed by their owners; contact info shown is public data from Google Business Profiles. Business owners can request updates or removal via the footer link.
