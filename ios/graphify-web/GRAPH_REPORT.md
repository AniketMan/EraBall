# Graph Report - .  (2026-07-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 496 nodes · 882 edges · 37 communities (35 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `simulatePlayoffs()` - 13 edges
2. `simulateSeason()` - 12 edges
3. `eraLabel()` - 11 edges
4. `PlayerCard()` - 9 edges
5. `simulatePlayoffs()` - 9 edges
6. `simulateSeason()` - 8 edges
7. `SimulationScreen()` - 7 edges
8. `playerBaseRating()` - 7 edges
9. `calcTeamRating()` - 7 edges
10. `rng()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `calcLeaderboardScore()`  [EXTRACTED]
  app/api/submit/route.ts → lib/supabase.ts
- `SimulationScreen()` --calls--> `upgradeGrade()`  [INFERRED]
  app/features/simulation/SimulationScreen.tsx → packages/engine/src/gameLogic.ts
- `SimulationScreen()` --calls--> `eraLabel()`  [EXTRACTED]
  app/features/simulation/SimulationScreen.tsx → src/lib/ui.ts
- `Home()` --calls--> `emptySlots()`  [EXTRACTED]
  app/page.tsx → src/lib/ui.ts
- `PlayerCard()` --calls--> `calcTS()`  [INFERRED]
  app/_shared/PlayerCard.tsx → app/ResultCard.tsx

## Import Cycles
- None detected.

## Communities (37 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (38): ALL_ERAS, AnchorType, BASE_RATING_OVERRIDE, BENCH_SLOTS, CAP_QUOTAS, DUO_PAIRS, ERA_DECADE_START, ERA_DIFFICULTY (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (28): CoachDraftScreen(), DraftScreen(), TAG_OPTIONS, TagKey, TEAM_ALIAS, ERA_DESC, ERA_YEARS, EraSelection() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (36): AnchorType, BASE_RATING_OVERRIDE, BENCH_SLOTS, ERA_DECADE_START, ERA_DIFFICULTY, ERA_LEAGUE_AVG_3PT, ERA_LEAGUE_AVG_REB, ERA_MOD_BACKWARD (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (36): ALL_ERAS, applyAnchors(), applyDuo(), applyFinalsMVP(), applyFlexTag(), applyFloorGeneral(), applyGlassCleaner(), applyRings() (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (29): POST(), ALL_ERAS, BEBAS, ERA_LABEL, eraLabel(), G, LeaderboardModal(), Mode (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (20): RunGameOptions, RunGameResult, TeamRatingResult, Coach, CourtSlot, Era, EraStats, GameLeader (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (14): G, RARITY_COLOR, RARITY_LABEL, Achievement, AchievementRarity, checkAchievements(), CheckFn, clearAchievements() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (15): Coach, CourtSlot, Era, EraStats, GameLeader, GamePhase, GameResult, Player (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (16): calcEraModifier(), calcFitPenalty(), calcPlayerAdjustedRating(), calcTeamDefTotals(), calcTeamRating(), calcTS(), coachChampBonus(), effectiveCoachBonus() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (13): calcAstFactor(), calcBlkScore(), calcPlayerDefFactor(), calcRebFactor(), coachBonus(), effNoise(), firstRoundLabel(), firstRoundWinsNeeded() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (14): calcAstFactor(), calcBlkScore(), calcPlayerDefFactor(), calcRebFactor(), coachBonus(), effectiveCoachBonus(), effNoise(), generateGameScore() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (9): AwardEntry, AwardThresholds, computeFinalsMVP(), computeSeasonAwards(), DEFAULT_THRESHOLDS, PLAYOFF_ROUND_LABELS, SimulationScreen(), calcTS() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (9): ALL_ERAS, eraLabel(), EraRow(), G, LifetimeStatsModal(), StatsPanel(), TabMode, clearLifetimeStats() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (11): V1_1_NOTES, V1_2_NOTES, V1_3_NOTES, V1_4_NOTES, V1_5_1_NOTES, V1_5_3_NOTES, V1_5_5_NOTES, V1_5_6_NOTES (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (4): C, PlayoffOutcome, ResultCard, ResultCardProps

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (9): GradeDisplay(), GradeDisplayProps, AllGrades, GradeA, GradeB, GradeC, GradeF, meta (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.44
Nodes (7): getCachedResponse(), getCoachHeadshot(), getShareCardHeadshot(), getShareCardHeadshots(), logPerf(), now(), _sessionCache

### Community 17 - "Community 17"
Cohesion: 0.36
Nodes (8): COACH_GURUS, CoachGuru, loadCoaches(), loadGameData(), loadPlayers(), now(), parseCoachesCSV(), PLAYER_SOURCES

### Community 18 - "Community 18"
Cohesion: 0.43
Nodes (7): defaults(), EraRecord, getLifetimeStats(), KEYS, recordLeaderboardPlacement(), recordRunComplete(), save()

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (7): AllVariants, Disabled, Ghost, Gold, meta, Outline, Story

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): FooterButton(), FooterButtonProps, Default, meta, Story, Supporters

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): FooterLink(), FooterLinkProps, Gold, meta, Muted, Story

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): GoldLabel(), GoldLabelProps, Default, LongText, meta, Story

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (6): Default, List, meta, Story, SupporterCard(), SupporterCardProps

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): Default, LongTip, meta, Story, TagTooltip(), TagTooltipProps

### Community 25 - "Community 25"
Cohesion: 0.48
Nodes (4): Btn(), BtnProps, BtnVariant, PlayerHeadshotProps

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (6): calcTeamDefTotals(), imputeBLK(), imputeSTL(), imputeTOV(), isBigPosition(), playerBaseRating()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): Fallback, Live, meta, SizeRange, Story

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (3): bebasNeue, inter, metadata

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (5): calcEraModifier(), calcTS(), getEstimatedFG3PCT(), isEstimatedShooter(), playerHeightInches()

### Community 30 - "Community 30"
Cohesion: 0.50
Nodes (5): calcFitPenalty(), calcPlayerAdjustedRating(), calcTeamRating(), coachChampBonus(), rateTeam()

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (3): coachDefGrade(), coachOffGrade(), gradeFromPct()

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (3): coachOverallGrade(), gradeToNumber(), numberToGrade()

## Knowledge Gaps
- **175 isolated node(s):** `G`, `RARITY_COLOR`, `RARITY_LABEL`, `ALL_ERAS`, `ERA_LABEL` (+170 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SimulationScreen()` connect `Community 11` to `Community 1`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **Why does `upgradeGrade()` connect `Community 11` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.262) - this node is a cross-community bridge._
- **Why does `Btn()` connect `Community 25` to `Community 19`, `Community 1`, `Community 11`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `G`, `RARITY_COLOR`, `RARITY_LABEL` to the rest of the system?**
  _175 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.037037037037037035 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10801393728222997 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._