# Graph Report - .  (2026-07-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 419 nodes · 972 edges · 17 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9c745f6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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

## God Nodes (most connected - your core abstractions)
1. `GameSession` - 35 edges
2. `EngineBridge` - 32 edges
3. `PlayerVM` - 21 edges
4. `Color` - 20 edges
5. `SwiftUI` - 18 edges
6. `PlayerTag` - 16 edges
7. `CoachVM` - 16 edges
8. `SlotVM` - 15 edges
9. `GameStateVM` - 14 edges
10. `GameCenterManager` - 14 edges

## Surprising Connections (you probably didn't know these)
- `PlayerCardView` --references--> `PlayerVM`  [EXTRACTED]
  Components/PlayerCardView.swift → Core/EngineBridge.swift
- `CourtSlotCell` --references--> `Color`  [EXTRACTED]
  Views/DraftView.swift → Components/Theme.swift
- `SpinReel` --references--> `Color`  [EXTRACTED]
  Views/DraftView.swift → Components/Theme.swift
- `CourtSlotCell` --references--> `PlayerVM`  [EXTRACTED]
  Views/DraftView.swift → Core/EngineBridge.swift
- `DraftView` --references--> `PlayerVM`  [EXTRACTED]
  Views/DraftView.swift → Core/EngineBridge.swift

## Import Cycles
- None detected.

## Communities (17 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (41): AnyShapeStyle, BleedImage, CGFloat, URL, CoachHeadshotView, PlayerHeadshotView, CGFloat, String (+33 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (12): App, EngineBridge, GameSession, Bool, Int, String, EraBallApp, JSContext (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (35): ButtonStyle, coachGradeColor(), Color, Elevation, EraBallDivider, eraDisplayLabel(), Fonts, G (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (39): Codable, AchievementStateVM, AchievementVM, AssignResultVM, AwardVM, BestRecordVM, CoachVM, CountEntryVM (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (12): clearAllLifetimeStats(), clearLifetimeStats(), coachView(), eligibleCoaches(), firstRoundLabel(), firstRoundWinsNeeded(), loadCoaches(), mulberry32() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (19): CGRect, CGSize, FlexibleWrap, FlowTags, Layout, PlayerCardView, Bool, CGFloat (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (12): AchievementID, GameCenterManager, LeaderboardID, Bool, Double, GKGameCenterViewController, GKLeaderboard, Int (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (15): GameCenterDelegate, GameCenterAuthView, Context, UIViewController, GameKit, GKGameCenterControllerDelegate, NSObject, UIViewControllerRepresentable (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (13): AVFoundation, AVPlayer, AudioManager, Bool, Double, String, GamePhase, coachDraft (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (10): CourtSlotCell, DraftView, PoolRow, SpinReel, Bool, CGFloat, Double, Int (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (13): allAchievements(), calcLeaderboardScore(), checkAchievements(), computeDuoFlags(), defaults(), finishRun(), getAllAchievements(), getLifetimeStats() (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (12): assign(), calcFitPenalty(), emptySlots(), fitPreview(), neededTiers(), remove(), spin(), startGame() (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.21
Nodes (12): calcEraModifier(), calcPlayerAdjustedRating(), calcTS(), getEstimatedFG3PCT(), imputeSTL(), imputeTOV(), isEstimatedShooter(), playerBaseRating() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.35
Nodes (11): calcAstFactor(), calcBlkScore(), calcPlayerDefFactor(), coachBonus(), effNoise(), generateGameScore(), playoffOppRating(), randn() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (11): calcRebFactor(), calcTeamDefTotals(), computeFinalsMVP(), computeSeasonAwards(), effectiveCoachBonus(), genOppTeamStats(), imputeBLK(), isBigPosition() (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (5): BridgeError, dataMissing, decode, initFailed, Error

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (5): activatedSlots(), calcTeamRating(), coachChampBonus(), rateTeam(), ratingView()

## Knowledge Gaps
- **20 isolated node(s):** `AVFoundation`, `Foundation`, `JavaScriptCore`, `timeless`, `offAnchor` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameSession` connect `Community 1` to `Community 8`, `Community 3`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `SwiftUI` connect `Community 0` to `Community 2`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `PlayerVM` connect `Community 3` to `Community 1`, `Community 2`, `Community 5`, `Community 9`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `AVFoundation`, `Foundation`, `JavaScriptCore` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05245901639344262 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07184325108853411 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._