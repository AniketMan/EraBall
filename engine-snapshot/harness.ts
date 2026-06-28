// harness.ts
// Deterministic behavior-lock harness for the EraBall simulation engine.
//
// PURPOSE
// Captures a byte-stable snapshot of the engine's output for a FIXED set of inputs
// with a SEEDED RNG. This snapshot is the regression baseline: after any refactor
// (relocating the engine, building the facade, decomposing the UI), re-running this
// harness must reproduce the saved snapshot exactly. Any divergence means behavior
// changed and the refactor is wrong.
//
// SCOPE
// This file imports the engine the same way the UI does and mirrors the exact
// orchestration sequence from app/page.tsx:
//   calcTeamRating -> simRaw (with champ bonus) -> simulateSeason -> simulatePlayoffs
// using effectiveCoachBonus and the cap-mode difficultyMod (0.90 / 1.0).
//
// USAGE
//   npx tsx engine-snapshot/harness.ts            (prints snapshot JSON to stdout)
//   npx tsx engine-snapshot/harness.ts --write     (writes baseline file)
//   npx tsx engine-snapshot/harness.ts --check     (compares against baseline file)

import * as fs from 'fs';
import * as path from 'path';
import type { Player, Coach, CourtSlot, Era, SlotPosition } from '../packages/engine/src';
import {
  withEraStats, applyFlexTag, applyRings, applyAnchors, applyTimeless,
  applyShootingStar, applyGlassCleaner, applyDuo,
  calcTeamRating, coachChampBonus, effectiveCoachBonus,
  simulateSeason, simulatePlayoffs,
  seedRng, clearRng,
} from '../packages/engine/src';

const DATA_DIR = path.join(__dirname, '..', 'public');
const BASELINE_FILE = path.join(__dirname, 'baseline.json');

// Fixed seed used for every deterministic run. Changing this invalidates the baseline.
const SEED = 1234567;

// The exact tag pipeline the UI applies to every player before simulation.
// Mirrors app/page.tsx (applyDuo(applyGlassCleaner(...applyFlexTag(withEraStats)))).
function buildPlayer(raw: Player, era: Era, team?: string): Player {
  return applyDuo(
    applyGlassCleaner(
      applyShootingStar(
        applyTimeless(
          applyAnchors(
            applyRings(
              applyFlexTag(
                withEraStats(raw, era, team),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// Load the raw player dataset (the baked-in artifact) and index by full_name.
function loadPlayers(): Map<string, Player> {
  const file = path.join(DATA_DIR, 'players_with_stats.json');
  const arr = JSON.parse(fs.readFileSync(file, 'utf8')) as Player[];
  const byName = new Map<string, Player>();
  for (const p of arr) {
    // Keep the first occurrence; the dataset can carry multiple era rows per name
    // but withEraStats re-derives era stats from stats_by_era, so the base row is enough.
    if (!byName.has(p.full_name)) byName.set(p.full_name, p);
  }
  return byName;
}

// Minimal CSV parser mirroring app/page.tsx parseCoachesCSV grade logic closely enough
// to produce a valid Coach for a known name. We only need ONE deterministic coach, so
// we select a well-known coach and derive grades the same way the UI does.
function loadCoach(targetName: string): Coach {
  const file = path.join(DATA_DIR, 'coaches.csv');
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n').filter(l => l.trim());
  const dataLines = lines.slice(3);
  for (const line of dataLines) {
    const cols = line.split(',');
    const name = cols[1]?.trim();
    if (!name || name === 'Coach') continue;
    if (name.replace(/\*$/, '') !== targetName && name !== targetName) continue;
    const from = parseInt(cols[2]) || 0;
    const to = parseInt(cols[3]) || 0;
    const regW = parseInt(cols[6]) || 0;
    const regL = parseInt(cols[7]) || 0;
    const regWLPct = parseFloat(cols[8]) || 0;
    const playoffG = parseInt(cols[10]) || 0;
    const playoffW = parseInt(cols[11]) || 0;
    const playoffL = parseInt(cols[12]) || 0;
    const playoffWLPct = parseFloat(cols[13]) || 0;
    const conf = parseInt(cols[14]) || 0;
    const champ = parseInt(cols[15]) || 0;
    const regG = regW + regL;
    const isHOF = name.endsWith('*');
    const capF = (g: string) => (regG > 200 && g === 'F' ? 'C' : g);
    const hofFloor = (g: string) => (isHOF && (g === 'C' || g === 'D' || g === 'F') ? 'B' : g);
    const rawOffGrade = regWLPct >= 0.600 ? 'A' : regWLPct >= 0.550 ? 'B' : regWLPct >= 0.500 ? 'C' : regWLPct >= 0.450 ? 'D' : 'F';
    const rawDefGrade = playoffG === 0 ? 'C' : playoffWLPct >= 0.550 ? 'A' : playoffWLPct >= 0.500 ? 'B' : playoffWLPct >= 0.450 ? 'C' : playoffWLPct >= 0.400 ? 'D' : 'F';
    const offGrade = hofFloor(capF(rawOffGrade)) as Coach['offGrade'];
    const defGrade = hofFloor(capF(rawDefGrade)) as Coach['defGrade'];
    const gradeN = (g: Coach['offGrade']) => ({ A: 4, B: 3, C: 2, D: 1, F: 0 }[g]);
    const avg = (gradeN(offGrade) + gradeN(defGrade)) / 2;
    const overallGrade = (avg >= 3.5 ? 'A' : avg >= 2.5 ? 'B' : avg >= 1.5 ? 'C' : avg >= 0.5 ? 'D' : 'F') as Coach['overallGrade'];
    return { name, from, to, years: to - from, regG, regW, regL, regWLPct, playoffG, playoffW, playoffL, playoffWLPct, conf, champ, offGrade, defGrade, overallGrade, offGuru: false, defGuru: false };
  }
  throw new Error(`Coach not found in CSV: ${targetName}`);
}

// Build a fixed 9-slot roster (5 starters + 4 bench) from known player names.
// Names chosen to exist across the dataset; slots assigned explicitly.
function buildRoster(byName: Map<string, Player>, era: Era): CourtSlot[] {
  const assignments: Array<{ name: string; slot: SlotPosition }> = [
    { name: 'Magic Johnson', slot: 'PG' },
    { name: 'Michael Jordan', slot: 'SG' },
    { name: 'Larry Bird', slot: 'SF' },
    { name: 'Tim Duncan', slot: 'PF' },
    { name: 'Kareem Abdul-Jabbar', slot: 'C' },
    { name: 'Scottie Pippen', slot: 'B1' },
    { name: 'Dennis Rodman', slot: 'B2' },
    { name: 'Ray Allen', slot: 'B3' },
    { name: 'Manu Ginobili', slot: 'B4' },
  ];
  const slots: CourtSlot[] = [];
  for (const a of assignments) {
    const raw = byName.get(a.name);
    if (!raw) throw new Error(`Fixture player missing from dataset: ${a.name}`);
    slots.push({ position: a.slot, player: buildPlayer(raw, era, raw.team_abbreviation) } as CourtSlot);
  }
  return slots;
}

// Mirror the UI duo-activation pass (app/page.tsx slotsWithDuo).
function applyDuoActivation(slots: CourtSlot[]): CourtSlot[] {
  return slots.map(slot => {
    if (!slot.player?.duoPartners) return slot;
    const duoActiveCount = slots.filter(s => s !== slot && s.player && slot.player!.duoPartners!.includes(s.player.full_name)).length;
    return { ...slot, player: { ...slot.player, duoActiveCount } };
  });
}

// Run the full canonical orchestration for one (era, capMode) combination.
function runCombo(byName: Map<string, Player>, coach: Coach, era: Era, capMode: boolean) {
  const slots = applyDuoActivation(buildRoster(byName, era));
  const { teamRating, rawRating, playerRatings } = calcTeamRating(slots, coach, era);
  const simRaw = rawRating * (1 + coachChampBonus(coach));
  const diff = capMode ? 0.90 : 1.0;
  const defB = effectiveCoachBonus(coach, 'def');
  const offB = effectiveCoachBonus(coach, 'off');

  const season = simulateSeason(simRaw, playerRatings, coach.defGrade, coach.offGrade, era, defB, offB, diff);
  const wins = season.games.filter(Boolean).length;
  const playoffs = simulatePlayoffs(simRaw, playerRatings, wins, coach.defGrade, coach.offGrade, era, defB, offB, diff);

  return {
    era, capMode,
    teamRating: round(teamRating), rawRating: round(rawRating), simRaw: round(simRaw),
    season: {
      wins: season.wins, losses: season.losses,
      avgTeamScore: round(season.avgTeamScore), avgOppScore: round(season.avgOppScore),
      games: season.games,
      seasonStats: season.seasonStats.map(s => ({
        name: s.player.full_name, slot: s.slot, GP: s.GP, MPG: round(s.MPG),
        PTS: round(s.PTS), REB: round(s.REB), AST: round(s.AST), STL: round(s.STL),
        BLK: round(s.BLK), TOV: round(s.TOV),
        FG_PCT: round(s.FG_PCT), FG3_PCT: s.FG3_PCT == null ? null : round(s.FG3_PCT), FT_PCT: round(s.FT_PCT),
      })),
      teamAnalysis: {
        spacingWinFactor: round(season.teamAnalysis.spacingWinFactor),
        shooterCount: round(season.teamAnalysis.shooterCount),
        spacingBaseline: season.teamAnalysis.spacingBaseline,
        isPreThreePt: season.teamAnalysis.isPreThreePt,
        highVolumeShooterCount: round(season.teamAnalysis.highVolumeShooterCount),
        rebFactor: round(season.teamAnalysis.rebFactor),
        blkScore: round(season.teamAnalysis.blkScore),
        astFactor: round(season.teamAnalysis.astFactor),
      },
    },
    playoffs: {
      champion: playoffs.champion,
      rounds: playoffs.rounds.map(r => ({ name: r.name, seriesWins: r.seriesWins, seriesLosses: r.seriesLosses, advanced: r.advanced, winsNeeded: r.winsNeeded })),
      gameCount: playoffs.allGames.length,
      gameScores: playoffs.allGames.map(g => ({ win: g.win, roundIndex: g.roundIndex, teamScore: g.teamScore, oppScore: g.oppScore })),
    },
  };
}

// Round floats to 6 decimals so snapshots are stable across platforms.
function round(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function buildSnapshot() {
  const byName = loadPlayers();
  const coach = loadCoach('Phil Jackson');
  const eras: Era[] = ['50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s'];
  const results: unknown[] = [];
  for (const era of eras) {
    for (const capMode of [false, true]) {
      // Re-seed before EACH combo so combos are independent and order-stable.
      seedRng(SEED);
      results.push(runCombo(byName, coach, era, capMode));
    }
  }
  clearRng();
  return { seed: SEED, coach: coach.name, combos: results };
}

function main() {
  const mode = process.argv[2];
  const snapshot = buildSnapshot();
  const json = JSON.stringify(snapshot, null, 2);

  if (mode === '--write') {
    fs.writeFileSync(BASELINE_FILE, json + '\n');
    console.log(`Baseline written: ${BASELINE_FILE} (${json.length} bytes)`);
    return;
  }

  if (mode === '--check') {
    if (!fs.existsSync(BASELINE_FILE)) {
      console.error('No baseline file found. Run with --write first.');
      process.exit(2);
    }
    const baseline = fs.readFileSync(BASELINE_FILE, 'utf8').trimEnd();
    if (baseline === json) {
      console.log('PASS: engine output matches baseline byte-for-byte.');
      process.exit(0);
    } else {
      console.error('FAIL: engine output diverged from baseline.');
      process.exit(1);
    }
  }

  // Default: print to stdout.
  console.log(json);
}

main();
