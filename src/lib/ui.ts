// src/lib/ui.ts
// Shared UI helper functions used across the feature screens.
//
// These are pure presentational/data-shaping helpers lifted verbatim from app/page.tsx
// so the feature modules can share one definition instead of each closing over a private
// copy. They are intentionally framework-light: plain functions plus a static team list.
//
// NOTE on determinism: shuffle() uses Math.random() and is DISPLAY-ONLY (it randomizes
// visual ordering of cards, never simulation outcomes). The engine simulation is fully
// seedable via @eraball/engine and is covered by the behavior-lock snapshot; this helper
// is deliberately left non-deterministic because matching the original UI behavior
// requires it, and it has zero effect on engine output.

import type { Player, Era, CourtSlot } from '@eraball/engine';
import { playerBaseRating, SLOT_POSITIONS } from '@eraball/engine';

// Fisher-Yates shuffle. Display-only (see file header note on determinism).
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Tier-keyed card background gradient.
// 50s era theme: a metallic greyscale luminance ladder so tiers stay distinct under the
// full-greyscale filter (which would otherwise flatten the color gradients into the same
// muddy grey). Kept in the darker range so white/gold card text stays legible.
export function tierBg(player: Player, fifties = false): string {
  const r = playerBaseRating(player, player.era as Era);
  if (fifties) {
    if (r >= 55) return 'linear-gradient(135deg, #949498 0%, #6c6c78 16%, #606070 38%, #6e6e7e 60%, #808090 78%, #949498 100%)';  // S: bright silver edges, readable center
    if (r >= 46) return 'linear-gradient(145deg, #606068 0%, #4c4c58 42%, #444452 72%, #585862 100%)';  // A: medium silver
    if (r >= 38) return 'linear-gradient(145deg, #464650 0%, #343440 42%, #2e2e38 72%, #3e3e48 100%)';  // B: dark steel - clear step below A
    if (r >= 31) return 'linear-gradient(145deg, #2e2e36 0%, #222230 42%, #1e1e26 72%, #28282e 100%)';  // C: darker - clear step below B
    if (r >= 24) return 'linear-gradient(145deg, #222228 0%, #1a1a20 42%, #161618 72%, #1e1e22 100%)';  // D: very dark
    if (r >= 16) return 'linear-gradient(145deg, #1a1a1e 0%, #121214 42%, #0e0e10 72%, #161618 100%)';  // E: near black
    return '#0e0e10';                                                                                    // F: flat
  }
  if (r >= 55) return 'linear-gradient(145deg, #0f0620 0%, #1e0c3d 40%, #130826 70%, #0a0415 100%)';  // S: amethyst
  if (r >= 46) return 'linear-gradient(145deg, #2e2000 0%, #6b4800 28%, #3e2a00 60%, #1c1200 100%)';  // A: gold
  if (r >= 38) return 'linear-gradient(145deg, #001508 0%, #002d12 40%, #001c0a 70%, #000e05 100%)';  // B: emerald
  if (r >= 31) return 'linear-gradient(145deg, #040e1c 0%, #0a1e3a 40%, #061428 70%, #020810 100%)';  // C: sapphire
  if (r >= 24) return 'linear-gradient(145deg, #1a0900 0%, #2e1200 40%, #1e0c00 70%, #100600 100%)';  // D: bronze
  if (r >= 16) return 'linear-gradient(145deg, #0e0e0e 0%, #181818 50%, #0e0e0e 100%)';               // E: charcoal
  return '#0a0a0a';                                                                                    // F: flat
}

// Tier-keyed metallic border for the 50s theme (brighter edge = higher tier).
export function fiftiesTierBorder(player: Player): string {
  const r = playerBaseRating(player, player.era as Era);
  if (r >= 55) return '#a0a0aa';
  if (r >= 46) return '#686870';
  if (r >= 38) return '#505058';
  if (r >= 31) return '#3a3a42';
  if (r >= 24) return '#2c2c34';
  if (r >= 16) return '#222228';
  return '#1a1a1e';
}

// Human-readable era label (the numeric decades get a full "20xx" prefix).
export function eraLabel(era: Era | string): string {
  return era === '00s' ? '2000s' : era === '10s' ? '2010s' : era === '20s' ? '2020s' : era;
}

// Static fallback team list - replaced at runtime by allTeams derived from player data.
export const NBA_TEAMS = ['ATL','BOS','BKN','CHA','CHI','CLE','DAL','DEN','DET','GSW','HOU','IND','LAC','LAL','MEM','MIA','MIL','MIN','NOP','NYK','OKC','ORL','PHI','PHX','POR','SAC','SAS','TOR','UTA','WAS'];

// Returns the team a player was on during a specific era, falling back to
// team_abbreviation (primary-era team) for players with no API season data.
export function playerTeamForEra(player: Player, era: Era): string {
  return player.teams_by_era?.[era] ?? player.team_abbreviation;
}

// Shared CDN/asset base URLs. R2 is the primary bucket; WORKER_BASE is the worker-proxied
// fallback used for audio and era banner assets. Centralized here so feature screens and
// the audio layer share one source of truth.
export const R2 = 'https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev';
export const WORKER_BASE = 'https://assets.eraball.com';

// Builds an empty 5-slot court (one per SLOT_POSITIONS entry).
export function emptySlots(): CourtSlot[] {
  return SLOT_POSITIONS.map(p => ({ position: p, player: null, fitPenalty: 0, fitLabel: null }));
}
