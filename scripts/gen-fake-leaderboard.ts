// gen-fake-leaderboard.ts
// Generates a plausible static leaderboard fixture used when no live backend is present
// (the fully-static fork). Output mirrors the exact Supabase row shape so the UI and the
// anti-corruption mapper treat it identically to live data.
//
// Run: npx tsx scripts/gen-fake-leaderboard.ts
// Output: public/fake-leaderboard.json  (keyed by `${era}_${mode}` -> LeaderboardEntry[])
//
// This is deterministic (seeded) so regenerating yields a stable fixture.

import * as fs from 'fs';
import * as path from 'path';

type Mode = 'normal' | 'salary_cap';

const ERAS = ['50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s', 'All-Time'];
const MODES: Mode[] = ['normal', 'salary_cap'];

// Deterministic PRNG (mulberry32) so the fixture is stable across regenerations.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260628);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number): number => min + Math.floor(rand() * (max - min + 1));

const TEAM_NAMES = [
  'Dynasty Core', 'Hardwood Kings', 'Era Breakers', 'The Mismatch', 'Glass Eaters',
  'Tempo Run', 'Switch Everything', 'Iso Heavy', 'Pace and Space', 'Grit and Grind',
  'The Process', 'Showtime II', 'Bad Boys Redux', 'Splash Era', 'Lob City Forever',
  'Triangle Offense', 'Seven Seconds', 'The Twin Towers', 'Point Forward', 'Stretch Five',
];

const COACHES = [
  ['Phil Jackson', 'A'], ['Gregg Popovich', 'A'], ['Pat Riley', 'A'], ['Red Auerbach', 'A'],
  ['Steve Kerr', 'B'], ['Erik Spoelstra', 'B'], ['Rick Carlisle', 'B'], ['Doc Rivers', 'C'],
  ['Don Nelson', 'C'], ['Mike DAntoni', 'C'], ['Scott Skiles', 'D'], ['Vinny Del Negro', 'F'],
] as const;

const PLAYOFF_RESULTS = [
  'champion', 'finals', 'conf_finals', 'second_round', 'first_round', null,
];

const GRADE_RANK: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

// Mirror of the engine's leaderboard scoring so fixture scores are internally consistent
// with what a real submission would produce. Kept in sync with lib/supabase.ts.
function calcScore(e: {
  reg_win_pct: number; playoff_win_pct: number; avg_pt_diff: number;
  team_rating: number; coach_grade: string | null; playoff_result: string | null;
}): number {
  const playoffBonus: Record<string, number> = {
    champion: 500, finals: 300, conf_finals: 175, second_round: 75, first_round: 25,
  };
  const bonus = e.playoff_result ? (playoffBonus[e.playoff_result] ?? 0) : 0;
  const coachNum = e.coach_grade ? (GRADE_RANK[e.coach_grade] ?? 0) : 0;
  return (
    e.reg_win_pct * 500 +
    e.playoff_win_pct * 400 +
    e.avg_pt_diff * 8 +
    e.team_rating * 3 +
    coachNum * 20 +
    bonus
  );
}

function seasonGamesFor(era: string): number {
  if (era === '50s' || era === '60s') return 72;
  return 82;
}

function makeEntry(era: string, mode: Mode): Record<string, unknown> {
  const games = seasonGamesFor(era);
  const regWins = randInt(Math.floor(games * 0.45), games);
  const regLosses = games - regWins;
  const regWinPct = Math.round((regWins / games) * 1000) / 1000;

  const playoffResult = pick(PLAYOFF_RESULTS);
  let poWins = 0;
  let poLosses = 0;
  if (playoffResult === 'champion') { poWins = 16; poLosses = randInt(0, 6); }
  else if (playoffResult === 'finals') { poWins = randInt(12, 15); poLosses = randInt(8, 12); }
  else if (playoffResult === 'conf_finals') { poWins = randInt(8, 11); poLosses = randInt(6, 9); }
  else if (playoffResult === 'second_round') { poWins = randInt(4, 7); poLosses = randInt(4, 8); }
  else if (playoffResult === 'first_round') { poWins = randInt(0, 3); poLosses = 4; }
  const poGames = poWins + poLosses;
  const poWinPct = poGames > 0 ? Math.round((poWins / poGames) * 1000) / 1000 : 0;

  const [coachName, coachGrade] = pick(COACHES as unknown as [string, string][]);
  const avgPtDiff = Math.round((rand() * 18 - 2) * 100) / 100;
  const teamRating = randInt(45, 72);

  const entry = {
    era,
    mode,
    team_name: pick(TEAM_NAMES),
    roster: null,
    reg_wins: regWins,
    reg_losses: regLosses,
    reg_win_pct: regWinPct,
    playoff_wins: poWins,
    playoff_losses: poLosses,
    playoff_win_pct: poWinPct,
    playoff_result: playoffResult,
    avg_pt_diff: avgPtDiff,
    team_rating: teamRating,
    coach_name: coachName,
    coach_grade: coachGrade,
  };
  const score = Math.round(calcScore(entry) * 100) / 100;
  return { ...entry, score };
}

function main(): void {
  const out: Record<string, unknown[]> = {};
  for (const era of ERAS) {
    for (const mode of MODES) {
      const n = randInt(18, 40);
      const entries = Array.from({ length: n }, () => makeEntry(era, mode));
      entries.sort((a, b) => (b.score as number) - (a.score as number));
      out[`${era}_${mode}`] = entries;
    }
  }
  const dest = path.join(__dirname, '..', 'public', 'fake-leaderboard.json');
  fs.writeFileSync(dest, JSON.stringify(out));
  const total = Object.values(out).reduce((s, a) => s + a.length, 0);
  console.log(`Wrote ${total} fake leaderboard rows across ${Object.keys(out).length} era/mode buckets -> ${dest}`);
}

main();
