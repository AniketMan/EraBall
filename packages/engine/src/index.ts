// @eraball/engine - public API surface
//
// This is the ONLY module consumers should import from. Everything re-exported here
// is the intentional, supported public interface of the simulation engine. Internal
// helpers in gameLogic.ts that are NOT re-exported here are private by convention and
// may change without notice.
//
// DESIGN NOTE (private-by-default, promote-on-demand):
// gameLogic.ts still uses `export` on many helpers because they are consumed across the
// engine's own modules and by the current UI during the migration. The facade is the
// contract: new consumers (other apps, terminal tools) import ONLY from here. Once the
// UI is fully migrated to the facade, the now-unused gameLogic exports can be demoted
// to module-private in a later pass without breaking the public contract.

// ---- High-level orchestration (preferred entry points) --------------------------------
export { runGame, rateTeam } from './orchestrator';
export type {
  RunGameOptions,
  RunGameResult,
  TeamRatingResult,
} from './orchestrator';

// ---- Deterministic RNG control --------------------------------------------------------
// Seed the engine for reproducible simulations (testing, snapshots, side-by-side compare).
// When unseeded, the engine uses Math.random() and behaves exactly as the original.
export { seedRng, clearRng, isSeeded, rng } from './rng';

// ---- Core simulation primitives -------------------------------------------------------
// Lower-level operations for consumers that need finer control than runGame().
export {
  calcTeamRating,
  simulateSeason,
  simulatePlayoffs,
} from './gameLogic';

// ---- Roster preparation (tag pipeline) ------------------------------------------------
// Consumers must apply these to raw players (in this order) before rating/simulating,
// exactly as the UI does: withEraStats -> applyFlexTag -> applyRings -> applySixthMan
// -> applyFinalsMVP -> applyAnchors -> applyTimeless -> applyShootingStar -> applyGlassCleaner -> applyDuo.
export {
  withEraStats,
  applyFlexTag,
  applyRings,
  applySixthMan,
  applyFinalsMVP,
  applyAnchors,
  applyTimeless,
  applyShootingStar,
  applyGlassCleaner,
  applyDuo,
} from './gameLogic';

// ---- Sixth Man membership ------------------------------------------------------------
// Consumers set slot.player.sixthManActive = SIXTH_MAN_PLAYERS.has(name) && slot is bench,
// exactly as the UI does when constructing court slots.
export { SIXTH_MAN_PLAYERS } from './gameLogic';

// ---- Player / coach analytics ---------------------------------------------------------
export {
  playerBaseRating,
  playerMatchesEra,
  calcTS,
  calcFitPenalty,
  calcEraModifier,
  playerTier,
  genOppTeamStats,
  calcTeamDefTotals,
  calcRebFactor,
} from './gameLogic';

// ---- Coach grading / bonuses ----------------------------------------------------------
export {
  coachBonus,
  effectiveCoachBonus,
  coachChampBonus,
  coachOffGrade,
  coachDefGrade,
  coachOverallGrade,
  gradeFromPct,
  gradeToNumber,
  numberToGrade,
} from './gameLogic';

// ---- Constants / metadata -------------------------------------------------------------
export {
  ALL_ERAS,
  SLOT_POSITIONS,
  SLOT_MPG,
  ERA_SEASON_GAMES,
  CAP_QUOTAS,
  DUO_PAIRS,
  firstRoundLabel,
  firstRoundWinsNeeded,
} from './gameLogic';

export type { OppTeamStats, PlayerTier } from './gameLogic';

// ---- Domain types ---------------------------------------------------------------------
export type {
  Era,
  Player,
  Coach,
  SlotPosition,
  CourtSlot,
  GamePhase,
  GameResult,
  EraStats,
  PlayerRating,
  PlayerSeasonStats,
  PlayoffRound,
  PlayoffGame,
  PlayoffResult,
  GameLeader,
  SpecialPerformance,
  TeamAnalysis,
  SeasonResult,
} from './types';
