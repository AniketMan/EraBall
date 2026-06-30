# EraBall: Original vs Refactored Build

Comparison of the pre-refactor baseline (`origin/main` @ `11b99b4`) against the
shipped refactor + deploy (`refactor/architecture` @ `72310e6`).
All numbers are pulled directly from git, not estimated.

## Headline

| Metric | Original | This Build | Change |
|---|---|---|---|
| `app/page.tsx` size | 5,629 lines | 497 lines | -91% |
| Largest single file | `page.tsx` (5,629) | `SimulationScreen.tsx` (1,920) | monolith broken up |
| Tracked `.ts`/`.tsx` files | 17 | 60 | +43 (modularized) |
| Feature screen modules | 0 (all inline) | 4 | extracted |
| Shared component modules | 0 | 8 (`app/_shared`) | extracted |
| Isolated engine package | none | `packages/engine` (2,243 lines) | new |
| Engine regression harness | none | `engine-snapshot` (baseline + check) | new |
| Storybook component stories | 0 | 8 | new |
| Live deployment | not deployed by us | `eraball.typicaltest.win` (Cloudflare) | shipped |

## Architecture

| Aspect | Original | This Build |
|---|---|---|
| App shape | Single 5.6k-line `page.tsx` holding every screen, the sim engine, awards math, modals, and the router | Thin router `page.tsx` (497 lines) that composes feature modules |
| Screens | Inline in `page.tsx` | `app/features/{era-selection,draft,coach-draft,simulation}/` |
| Shared UI | Inline plus a few root-level modals (`AchievementsModal`, `LeaderboardModal`, `LifetimeStatsModal`, `ResultCard`) | `app/_shared/` (TopBar, PlayerCard, CourtSlotView, CoachHeadshot, HowToPlayModal, PatchNotesModal, SupportersModal, barrel `index.ts`) |
| Simulation engine | Embedded in the page component | Standalone `packages/engine` (gameLogic, orchestrator, rng, types) behind an `@eraball/engine` facade |
| Game logic location | Inline in `page.tsx` | `packages/engine/src/gameLogic.ts` (1,808) plus `lib/gameLogic.ts` |
| Components / services / lib | All inline | `components/` (18), `services/` (3), `lib/` (5) as discrete units |

## Correctness Safety Net (new in this build)

| Aspect | Original | This Build |
|---|---|---|
| Behavior guarantee | manual / none | `engine-snapshot/harness.ts --check` validates sim output byte-for-byte against `baseline.json` |
| Component catalog | none | Storybook static build, 8 stories |
| Build gate | `next build` | `next build` + behavior-lock + Storybook |

The engine extraction was verified byte-for-byte identical to the original, so the
refactor changed structure only, not simulation results.

## Deploy / Runtime

| Aspect | Original | This Build |
|---|---|---|
| Deploy target config | `vercel.json` (cache headers only) | Cloudflare Pages via `@cloudflare/next-on-pages` |
| API route runtime | Node default (no edge export) | `export const runtime = 'edge'` on all 3 routes (`submit`, `headshot`, `coach-headshot`) |
| OG image | `app/opengraph-image.png` (file-convention dynamic route) | moved to `public/opengraph-image.png` (static asset; removes an incompatible dynamic route) |
| Node compat | n/a | `nodejs_compat` flag plus `compatibility_date 2024-09-23` set on the Pages project (needed for `node:buffer`, `node:async_hooks`) |
| Live URL | not deployed | `https://eraball.typicaltest.win` (alias `eraball-7f4.pages.dev`) |
| Leaderboard backend | Supabase write | same route; falls back to not-connected when `SUPABASE_SERVICE_ROLE_KEY` is unset (by design) |

## Net Diff

`64 files changed, 22,357 insertions(+), 5,161 deletions(-)` between baseline and this build.

The insertion count is inflated by the new `packages/engine`, Storybook config/stories,
the snapshot harness, and the lockfile; the functional UI/engine behavior is unchanged
(enforced by the snapshot check). The deletions are almost entirely the `page.tsx`
monolith being split out into modules.
