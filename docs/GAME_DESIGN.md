# EraBall — Game Design Document

**Status:** authoritative design spec · **Source of truth:** the web app (`app/features/*` + `packages/engine`) · **Applies to:** web **and** iOS identically (see [§16 Platform Parity](#16-platform-parity)).

This document describes *what the game is and how it plays*. For the exact simulation math see [`../ERABALL_ENGINE.md`](../ERABALL_ENGINE.md); this doc covers the player-facing design that both platforms must implement the same way.

---

## 1. High Concept

EraBall is an **NBA historical draft simulator**. You pick a decade, spin to draft an all-time nine-man roster across eras, draft a coach, then simulate a full season and playoff run. Cross-era players are penalized for stylistic fit, so building a *coherent* team beats hoarding raw talent. Every run earns a leaderboard score.

**Fantasy:** "Could a 1960s Wilt survive in the pace-and-space 2020s? Build the team, run the season, prove it."

**Session length:** ~3–6 minutes per run. Endlessly replayable (random spins + per-run variance).

---

## 2. Core Loop

```
Era Select → Player Draft (9) → Coach Draft → Simulate Season → [Playoffs] → Results → Leaderboard
     ↑                                                                                      │
     └──────────────────────────────── Play Again ─────────────────────────────────────────┘
```

Meta-progression persists across runs: **Lifetime Stats** and **Achievements**.

---

## 3. Modes

| Mode | Entry | Rules |
|------|-------|-------|
| **Normal Draft** | Era → "Normal Draft" | Standard spin-draft. The default competitive mode. |
| **Salary Cap Draft** | Era → "Salary Cap Draft" | Roster must satisfy tier quotas (see [§5.4](#54-salary-cap-tiers)). Harder; distinct leaderboard. Applies a 0.90 difficulty modifier to opponents. |
| **Sandbox** | Era → "or play → Sandbox" | Free roster building: search/pick any player or team directly, load tag pools, no re-spin limit. Does **not** record to leaderboard/lifetime stats. |

---

## 4. Phase 1 — Era Selection

Choose one of **8 decades**. This "sim era" sets the pace, scoring baselines, playoff format, and how out-of-era players are penalized.

| Era | Label | Character | Season | Playoffs R1 |
|-----|-------|-----------|--------|-------------|
| 50s | 1950s | Slow, physical, no 3-pt. Big men rule. | 72 games | Best of 3 |
| 60s | 1960s | Dominant bigs, Russell era. | 72 games | Best of 3 |
| 70s | 1970s | ABA merger, brutal defense, Kareem. | 82 games | Best of 3 |
| 80s | 1980s | 3-pt line arrives. Magic vs Bird. | 82 games | Best of 5 |
| 90s | 1990s | All-time defenses, hand-checking, Jordan. | 82 games | Best of 5 |
| 00s | 2000s | Shaq & Kobe, 4-round best-of-7 playoffs. | 82 games | Best of 7 |
| 10s | 2010s | 3-pt surge, positionless, Steph vs LeBron. | 82 games | Best of 7 |
| 20s | 2020s | Peak spacing & pace. Versatility is king. | 82 games | Best of 7 |

- **Random** button spins the era wheel (slot-machine cadence: fast → slow → land).
- Selecting an era reveals its banner art, years, one-line style note, and a penalty hint.
- **Cross-era penalty (core mechanic):** a player performs best in their *native* decade. Drafting across decades multiplies their rating down by era distance and direction — forward (old player in a newer era) is harsher than backward, with carve-outs for **Timeless** players and tall centers. Pre-3PT players lose the most in 3-pt eras. See [`ERABALL_ENGINE.md` → Era Modifier](../ERABALL_ENGINE.md).

---

## 5. Phase 2 — Player Draft

Fill **9 slots**: 5 starters (PG, SG, SF, PF, C) + 4 bench (B1–B4).

### 5.1 Spin & Pool
- Each **spin** lands on a **franchise + era** combo (only combos with ≥3 available players can land).
- The pool is everyone who played for that team during that decade, tagged and sorted by scoring.
- Pick **one** player from the pool into an open slot.
- **One re-spin** for the entire draft (Normal mode). Spending it or not affects the coach draft (see [§7.4](#74-coach-respin-budget)).

### 5.2 Minutes
Total 240 min/game. Starters ~35 MPG; bench B1 25 / B2 15 / B3 13 / B4 12. Stats scale from a player's natural baseline to their assigned minutes.

### 5.3 Positional Fit
| Placement | Penalty |
|-----------|---------|
| Natural position | 0% |
| One position off | −10% |
| Way out of position | −25% |
| Bench (B1–B4) | always 0% |

- **FLEX** players (LeBron, Jokić, Giannis…) occupy several listed slots penalty-free.
- **Position locks** restrict certain players to specific slots.

### 5.4 Salary Cap Tiers
Every player has a tier from their base rating. Salary-Cap rosters must hit exact quotas:

| Tier | Base rating | Quota |
|------|-------------|-------|
| S | ≥ 55 | 2 |
| A | ≥ 46 | 2 |
| B | ≥ 38 | 2 |
| C | ≥ 31 | 2 |
| D | < 31 | 1 |

The spin engine *guarantees* it can still land a combo containing a needed tier, so a cap roster is always completable.

---

## 6. Player Tags & Rating

A player's **base rating** blends era-adjusted stats (PTS, REB, AST, true-shooting, 3-pt volume, STL/BLK, −TOV) with tag bonuses. **Adjusted rating = base × (1 − fit penalty) × era modifier.**

### 6.1 Tags (11)
| Tag | Color | Effect |
|-----|-------|--------|
| **Timeless** | violet | Cross-era penalty largely waived (95–100%). |
| **Offensive Anchor** | gold | +8 base (T1) / +4 (T2). |
| **Defensive Anchor** | blue | +12 base (T1) / +6 (T2); also lowers opponent scoring in-sim. |
| **Floor General** | pale violet | +5 base (T1) / +3 (T2). |
| **Shooting Star** | pink | Multiplies contribution to team spacing (T1 > T2). |
| **Glass Cleaner** | green | 1.5× rebounding weight → boosts team rebound factor. |
| **Flex** | blue | Multiple starter slots with no fit penalty. |
| **Champion** | gold | Ring count → playoff win-odds + scoring boost. |
| **Dynamic Duo** | teal | +5 base per drafted partner (stacks; trios exist). |
| **Sixth Man** | orange | +5 base when placed on the bench. |
| **Finals MVP** | amber | Extra boost in the Finals round. |
| *(Greatest 75)* | — | +3 base; also drives stat imputation for pre-tracking eras. |

Tags are applied through a fixed **pipeline** (order is load-bearing and identical on both platforms):
`withEraStats → applyFlexTag → applyRings → applySixthMan → applyFinalsMVP → applyAnchors → applyFloorGeneral → applyTimeless → applyShootingStar → applyGlassCleaner → applyDuo`.

---

## 7. Phase 3 — Coach Draft

### 7.1 Flow
**One spin reveals three coaches; pick one.** (Sandbox/dev can search a coach directly.)

### 7.2 Grades
Coaches are graded **S–F** from real NBA records: **offense** from regular-season win %, **defense** from playoff win %. Overall is the letter average; a coach reaching a 4.5 average is **S**. Grades apply a team-rating bonus and shift opponent scoring.

### 7.3 Modifiers
- **Gurus** — hand-picked coaches whose off and/or def grade is forced to A ("OFF GURU" / "DEF GURU" / "COMPLETE" badges). HOF coaches get a minimum B on data-derived grades.
- **Franchise Pair** — if a drafted player matches the coach's franchise list, that coach's grades are **upgraded one step** (e.g. A→S), shown with a "FRANCHISE PAIR" badge.

### 7.4 Coach Respin Budget
- **2 spins** normally.
- **3 spins** if you carried over an **unused player re-spin** from the draft.

---

## 8. Phase 4 — Simulation

### 8.1 Regular Season
Every game rolls the team rating vs a normal-distributed opponent (era-scaled), blended with rebounding, playmaking, spacing, and coach bonuses. Results reveal via an animated ticker. A ~50-rating team wins ~56–58 of 82.

### 8.2 Stat Distribution (proportional)
Player box scores are **not** independently sampled — each player's points are distributed from the *actual* simulated team score by weight, so the box score always sums to the team total. Per-run variance (±15%) makes every season look different. See [`ERABALL_ENGINE.md` → Stat Distribution](../ERABALL_ENGINE.md).

### 8.3 Playoff Qualification
Win **≥ half your games** (`ceil(seasonGames/2)` → **36** in 72-game eras, **41** in 82-game eras).

---

## 9. Playoffs

- **Bracket:** First Round → Semifinals → Conference Finals → NBA Finals.
- **Series length:** Round 1 varies by era (Best of 3/5/7); later rounds always Best of 7 (first to 4).
- **Opponent difficulty** scales with round *and* your regular-season record (higher seeds get easier first rounds; everyone faces elite opposition by the Finals).
- **Rings** boost win odds and the score ceiling; **Finals MVP** players get an extra Finals boost.
- **Special performances** (ring-weighted) produce eruption/triple-double flavor lines.
- Champions crown a **Finals MVP** (playoff stats, highest PPG, APG tiebreak).

---

## 10. Season Awards

Computed from final stats + ratings; each is optional (shown only if a player qualifies).

| Award | Gate (default thresholds) |
|-------|----------|
| **League MVP** | Team ≥ 50 wins; guaranteed on a triple-double avg, else base > 55 and > 24 PPG. Historic (≥78 win) seasons auto-award the top scorer. |
| **All-NBA First Team** | One per starter slot: adjusted > 50 and > 24 PPG. |
| **All-Star** | Adjusted > 48, position-scaled PPG floor, plus a secondary impact stat. Guarantees at 30 PPG and 65/67-win seasons. |
| **Defensive POY** | Base > 50 with elite STL/BLK (or a big-man REB+BLK path). |
| **6th Man of the Year** | Bench only: > 14 PPG and adjusted > 48, top-2 bench rating. |
| **Finals MVP** | Champions only (see §9). |

---

## 11. Scoring & Leaderboards

Each recorded run computes a **score**:

```
score = reg_win_pct·500 + playoff_win_pct·400 + avg_pt_diff·8
      + team_rating·3   + coach_grade·20
      + playoff_bonus + challenge_bonus + team_bonus
```

- **Playoff bonus:** champion 500 · finals 350 · conf finals 175 · 2nd round 75 · 1st round 25.
- **Challenge bonus (champions only):** no Timeless player +75 · no S-tier player +225 · F-grade coach +75.
- **Team bonus:** elite spacing +40 · elite rim +50 · elite playmaking +40 · rebounding edge +25 · duo pair +30 · duo trio +65 · sixth-man on bench +20.

Leaderboards are **per era × per mode** (Normal / Salary Cap), with a weekly board. Submitting a run also records your placement.

---

## 12. Achievements

Unlocked from lifetime aggregates + per-run context (e.g. first ring, dynasty (5), legend (20), GOAT (50), era-specific titles, cap-mode champ, sweeps, perfect season, duo/brother-duo builds, leaderboard rank). Shown via a toast on unlock and an Achievements gallery. Definitions live in `lib/achievements.ts` (shared verbatim by both platforms).

---

## 13. Lifetime Stats

Persisted per mode: drafts completed, total W/L, championships (total + by era), best/worst records, most-drafted players/coaches, highest team rating. Web uses `localStorage`; iOS uses a UserDefaults-backed shim so the *same* code persists identically.

---

## 14. Meta / Progression

No unlockable content gates play — every era, player, and coach is available from the start. Progression is **mastery + collection**: climbing leaderboards, completing the achievement set, and growing lifetime stats. Challenge modifiers (no-Timeless, no-S-tier, bad-coach championships) reward self-imposed difficulty with score.

---

## 15. Visual & Audio Identity

- **Palette:** deep black (#000) canvas, **gold** (#C9A84C) primary accent, purple for Salary Cap, plus per-tag colors (see [§6.1](#61-tags-11)).
- **Type:** Bebas Neue for display/headers; system sans for body. Hard rectangles (no rounded corners) — a stark, editorial look.
- **Motion:** slot-machine spin reels (fast→slow→land) for era, team/era, and coach; animated starfield on the menu; game-by-game season ticker.
- **Era theming:** each era has banner art (R2-hosted `.webp`) and looping era music; a greyscale "50s theme" toggle. Audio is mutable.

Design tokens are centralized (web `src/components/tokens.ts`; iOS `Theme.swift`) so the two stay in lockstep.

---

## 16. Platform Parity

**The design is identical on web and iOS by construction, not by manual duplication.**

1. **Same engine.** iOS does not reimplement any rule. It bundles the real `@eraball/engine` and executes it in **JavaScriptCore**, verified **byte-for-byte** against `engine-snapshot/baseline.json` across all 8 eras × 2 modes. Every number in this doc — ratings, penalties, sim, awards, score — is produced by that one engine on both platforms.
2. **Same UI orchestration.** The spin/pool logic, tag pipeline, coach parsing (gurus, franchise pairs, S-grade), awards, and leaderboard flags are ported verbatim into the iOS engine bridge (`ios/EngineSrc/engine-entry.ts`) from the web feature source.
3. **Mirrored screens.** Each SwiftUI screen is a port of its web counterpart:

   | Design phase | Web (source of truth) | iOS |
   |---|---|---|
   | Era select | `app/features/era-selection/EraSelection.tsx` | `Views/EraSelectView.swift` |
   | Player draft | `app/features/draft/DraftScreen.tsx` | `Views/DraftView.swift` |
   | Coach draft | `app/features/coach-draft/CoachDraftScreen.tsx` | `Views/CoachDraftView.swift` |
   | Simulation & results | `app/features/simulation/SimulationScreen.tsx` | `Views/SimulationView.swift` |
   | Shared modals | `app/_shared/*Modal.tsx` | `Views/Modals.swift`, sheets |
   | Design tokens | `src/components/tokens.ts` | `Components/Theme.swift` |

4. **iOS-only additions** (do not change the design, only the platform): native **Game Center** leaderboards/achievements mirroring the in-game score, and Liquid-Glass chrome consistent with the same palette.

**Rule of thumb for contributors:** design changes land in the **web** engine/screens first (that's the source of truth), then flow to iOS — the engine via a re-bundle (`ios` `engine.js` + snapshot check), the screens via their SwiftUI port. Never fork a rule into Swift.
