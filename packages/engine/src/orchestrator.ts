// orchestrator.ts
// High-level entry point for the EraBall simulation engine.
//
// PURPOSE
// The UI historically wired together calcTeamRating -> simRaw -> simulateSeason ->
// simulatePlayoffs by hand, duplicating the exact coefficient plumbing (champ bonus,
// effectiveCoachBonus, cap-mode difficulty). That orchestration knowledge leaked into
// the component. This module captures it ONCE so any consumer (this UI, a future app,
// a terminal script) can run a full game with a single call and zero internal knowledge.
//
// BEHAVIOR CONTRACT
// This is a pure re-composition of existing engine functions in the SAME order and with
// the SAME arguments the UI already used. It introduces no new math. Output is identical
// to calling the underlying functions directly. The behavior-lock snapshot proves this.

import type { CourtSlot, Coach, Era, PlayerRating, SeasonResult, PlayoffResult } from './types';

import {
  calcTeamRating, coachChampBonus, effectiveCoachBonus,
  simulateSeason, simulatePlayoffs,
} from './gameLogic';

// Difficulty modifier applied in salary-cap mode (matches the UI's 0.90 / 1.0 constant).
const CAP_MODE_DIFFICULTY = 0.90;
const NORMAL_DIFFICULTY = 1.0;

export interface RunGameOptions {
  // When true, applies salary-cap difficulty (0.90). Defaults to false (normal, 1.0).
  capMode?: boolean;
}

export interface TeamRatingResult {
  teamRating: number;
  rawRating: number;
  // rawRating with the coach championship bonus folded in; this is what the sims consume.
  simRaw: number;
  playerRatings: PlayerRating[];
}

export interface RunGameResult {
  rating: TeamRatingResult;
  season: SeasonResult;
  // Regular-season wins, derived from the season game log (used to seed playoff bracket).
  regularSeasonWins: number;
  playoffs: PlayoffResult;
}

// rateTeam: compute team and player ratings for a roster, including the champ-bonus simRaw
// the simulations require. Mirrors app/page.tsx exactly (calcTeamRating + coachChampBonus).
export function rateTeam(slots: CourtSlot[], coach: Coach, era: Era): TeamRatingResult {
  const { teamRating, rawRating, playerRatings } = calcTeamRating(slots, coach, era);
  const simRaw = rawRating * (1 + coachChampBonus(coach));
  return { teamRating, rawRating, simRaw, playerRatings };
}

// runGame: execute a full season + playoff run for a rated roster.
// This is the primary high-level engine operation for consumers.
export function runGame(
  slots: CourtSlot[],
  coach: Coach,
  era: Era,
  options: RunGameOptions = {},
): RunGameResult {
  const difficulty = options.capMode ? CAP_MODE_DIFFICULTY : NORMAL_DIFFICULTY;
  const rating = rateTeam(slots, coach, era);
  const defBonus = effectiveCoachBonus(coach, 'def');
  const offBonus = effectiveCoachBonus(coach, 'off');

  const season = simulateSeason(
    rating.simRaw, rating.playerRatings, coach.defGrade, coach.offGrade, era, defBonus, offBonus, difficulty,
  );
  const regularSeasonWins = season.games.filter(Boolean).length;
  const playoffs = simulatePlayoffs(
    rating.simRaw, rating.playerRatings, regularSeasonWins, coach.defGrade, coach.offGrade, era, defBonus, offBonus, difficulty,
  );

  return { rating, season, regularSeasonWins, playoffs };
}
