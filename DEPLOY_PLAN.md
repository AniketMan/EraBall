# EraBall Deployment & Optimization Plan

## Goal
Deploy `EshanBhatt/EraBall` to `eraball.typicaltest.win` under your Cloudflare account, while fixing the 5MB uncompressed payload issue so the app loads instantly for users.

## Current State & Challenges
1. **The 5MB Payload**: The app fetches `players_with_stats.json` directly from an R2 `pub-*.r2.dev` endpoint. Cloudflare does **not** compress raw `.r2.dev` endpoints. This means every new user downloads 5.13MB of uncompressed JSON, slowing down the draft screen load.
2. **Next.js Server Routes**: The app is not purely static. It has server-side API routes (`/api/submit`, `/api/headshot`) that require a runtime environment.
3. **Database Dependency**: The leaderboard submits to a hardcoded Supabase instance and requires a `SUPABASE_SERVICE_ROLE_KEY` to function.

---

## Execution Steps

### 1. Fix the Payload Compression (Cloudflare R2 + Custom Domain)
We will route the R2 bucket through your Cloudflare zone so it benefits from Cloudflare's edge caching and automatic gzip/Brotli compression.

- **Action**: Create a new R2 bucket in your account (e.g., `eraball-data`).
- **Action**: Download the 5.13MB `players_with_stats.json` from the current URL and upload it to your new R2 bucket.
- **Action**: Bind the R2 bucket to a custom subdomain (e.g., `data.typicaltest.win`). Cloudflare automatically compresses JSON on custom domains.
- **Code Change**: Update `app/page.tsx` to fetch from `https://data.typicaltest.win/players_with_stats.json` instead of the raw `.r2.dev` URL.

### 2. Deploy the App to Cloudflare Pages
Since you already use Cloudflare Pages heavily (10 existing projects), we will deploy the Next.js app there using the `@cloudflare/next-on-pages` adapter to support the server-side API routes.

- **Action**: Create a new Cloudflare Pages project named `eraball`.
- **Action**: Bind the custom domain `eraball.typicaltest.win` to this Pages project.
- **Code Change**: Install `@cloudflare/next-on-pages` and update `next.config.ts` if needed to ensure Edge runtime compatibility for the API routes.
- **Action**: Push the modified code to a private GitHub repo on your account and connect it to the Pages project for automated builds.

### 3. Handle the Database (Supabase)
The app currently hardcodes Eshan's Supabase URL.

- **Question for you**: Do you want to continue writing leaderboard entries to Eshan's Supabase database, or do you want to set up your own Supabase project so you own the data?
  - *If Eshan's*: You will need him to provide the `SUPABASE_SERVICE_ROLE_KEY` so we can add it as an environment variable in Cloudflare Pages.
  - *If your own*: We will need to create a new Supabase project, run the schema SQL (which we'd need to extract/recreate), and update `lib/supabase.ts` with your new URL and Anon Key.

---

## Risks & Rollback
- **Risk**: The Next.js API routes (`/api/headshot` proxy and `/api/submit`) might require minor refactoring to run on Cloudflare's Edge runtime (Workers) instead of Node.js.
- **Rollback**: None required. This is a fresh deployment on a new subdomain (`eraball.typicaltest.win`). It does not affect Eshan's existing production deployment or your other `typicaltest.win` subdomains.

---

## Next Steps
Before I execute this, please confirm:
1. Does this plan look good?
2. How do you want to handle the Supabase database (use Eshan's or create your own)?
