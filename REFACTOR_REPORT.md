# EraBall Architecture Refactor - Completion Report

Branch: `refactor/architecture` (fork `AniketMan/EraBall`, upstream `EshanBhatt/EraBall`)
Status: COMPLETE. Build green, behavior-lock PASS byte-for-byte, Storybook catalog builds.

## Goal

Transform a monolithic `app/page.tsx` (~5300 lines pre-refactor; ~2400 at the start of this
session) into a clean, feature-modular architecture without changing any runtime behavior.
Behavior parity is enforced mechanically by a deterministic snapshot harness, not by eye.

## Final layout

```
packages/engine/src/        Callable, seedable game engine (no React, no DOM)
  gameLogic.ts   (1808)     Core sim: ratings, season, playoffs, awards math
  types.ts        (192)     Shared domain types (Player, Coach, Era, ...)
  rng.ts           (55)     Seedable RNG (replaces Math.random for determinism)
  orchestrator.ts  (78)     High-level run orchestration
  index.ts        (110)     Public facade - the ONLY entry point app code imports

services/                   Anti-corruption layer (UI never touches fetch/supabase/proxy)
  leaderboard.ts            submitEntry / getLeaderboard  [PERF] logged, graceful fallback
  headshots.ts              getShareCardHeadshots / getCoachHeadshot  [PERF] logged
  playerData.ts             loadGameData / parseCoachesCSV  [PERF] logged

src/components/             Shared presentational library (pure, prop-driven, Storybook)
  tokens.ts        (28)     Canonical design tokens (G palette, BEBAS) - single source
  Btn, GoldLabel, GradeDisplay, TagTooltip, PlayerHeadshot,
  FooterLink, FooterButton, SupporterCard  (+ one .stories.tsx each)
  index.ts                  Barrel

src/lib/ui.ts     (86)      Display-only helpers (shuffle, tierBg, fiftiesTierBorder,
                            eraLabel, NBA_TEAMS, playerTeamForEra, emptySlots, R2, WORKER_BASE)

app/_shared/                Game-specific view atoms + modals reused across screens
  CoachHeadshot, PlayerCard, CourtSlotView, HowToPlayModal,
  SupportersModal, TopBar, PatchNotesModal  + index.ts barrel

app/features/               Self-contained stateful feature screens
  era-selection/EraSelection.tsx   (300)
  draft/DraftScreen.tsx           (1368)   (owns TagKey + TAG_OPTIONS)
  coach-draft/CoachDraftScreen.tsx (264)
  simulation/SimulationScreen.tsx (1920)   (owns StatsTable, awards computation,
                                            playoff reactions, award thresholds)

app/page.tsx      (497)     Thin router: Home() + era-audio orchestration only
```

## What changed in the final phase (Phase 8 -> 9)

1. Extracted the entire inline simulation cluster (StatsTable, getPlayoffReaction,
   AwardThresholds/DEFAULT_THRESHOLDS, computeSeasonAwards, computeFinalsMVP,
   SeasonAwardsPanel, and SimulationScreen) into `app/features/simulation/SimulationScreen.tsx`.
2. Routed an inline `import('../lib/types').PlayoffGame` type reference through the
   `@eraball/engine` facade instead of a brittle relative path that bypassed the engine API.
3. Added the engine/lib symbols the module actually closes over but that a surface grep can
   miss: `coachBonus`, `coachChampBonus`, `effectiveCoachBonus` (engine) and
   `recordRunComplete`, `getLifetimeStats` (lib/lifetimeStats). These were caught by the
   full TypeScript build, which is why a `next build` typecheck - not just a symbol scan -
   is the correct extraction gate.
4. Wired `SimulationScreen` into `page.tsx` and pruned every now-dead import. `page.tsx`
   dropped from ~2400 to 497 lines and contains exactly two top-level declarations:
   `getAudioElement` (+ its audio consts) and `Home()`.

The era-audio map (`ERA_AUDIO`, `getAudioElement`, `_audioElements`, `R2`, `WORKER_BASE`)
was intentionally LEFT in `page.tsx`: it is owned by the root component's lifecycle and is
not shared by any feature screen, so promoting it to a module would add indirection without
a consumer. Scope was held to what the refactor requires.

## Verification gates (run after every step)

- Production build:  `npm run build`  -> compiles, typechecks, prerenders 10 routes.
- Behavior-lock:     `npx tsx engine-snapshot/harness.ts --check`  -> "PASS: engine output
                     matches baseline byte-for-byte." (regenerate baseline by omitting --check)
- Component catalog: `./node_modules/.bin/storybook build`  -> static catalog of 8 components.

## Guarantees held

- Behavior-identical: every step passed the byte-for-byte snapshot.
- Fork-first + durable: pushed to `origin/refactor/architecture` after every phase step.
- Anti-corruption: no UI module imports fetch/supabase/proxy directly; all I/O goes through
  `services/`, each with graceful live-backend -> static-fork fallback and `[PERF]` logging.
- ASCII-only for new code; existing literal glyphs preserved verbatim during extraction.
- Pure refactor: no behavior, no rules, no balance numbers were altered.
