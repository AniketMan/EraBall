// services/playerData.ts
// Anti-corruption boundary for the static game datasets (player stats + coaches).
//
// The UI talks ONLY to this module for dataset loading. It owns:
//   - the multi-MB player dataset load with a graceful source chain, and
//   - the coaches.csv load + parse (including the COACH_GURUS overrides), relocated here
//     intact because parsing external CSV into domain Coach objects is a service concern.
//
// Source chain for players_with_stats.json (first success wins):
//   1. /players_with_stats.json        -- baked into public/, served same-origin (fast, offline-safe)
//   2. R2 public bucket                -- original remote source, kept for drop-in compatibility
//   3. assets.eraball.com Worker       -- secondary remote mirror
//
// Putting the local copy first makes the fork fully static while the two remote URLs
// remain as fallbacks so the same code still works in Eshan's remote-asset setup.
//
// [PERF] dataset load is timed and its payload size logged:
//   `[PERF] data load: Xms, Xbytes (source)`

import type { Player, Coach } from '@eraball/engine';

// Ordered candidate sources for the player dataset. Local first for the static fork.
const PLAYER_SOURCES = [
  '/players_with_stats.json',
  'https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev/players_with_stats.json',
  'https://assets.eraball.com/players_with_stats.json',
] as const;

const COACHES_SOURCE = '/coaches.csv';

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// ─── Coach guru overrides ─────────────────────────────────────────────────────
// Keys must match the name field in coaches.csv exactly (including * for HOF).
// offGuru / defGuru force that grade to A.
// offOverride / defOverride set an explicit grade (takes effect after guru check).
type CoachGuru = {
  offGuru?: boolean;
  defGuru?: boolean;
  offOverride?: Coach['offGrade'];
  defOverride?: Coach['defGrade'];
};

const COACH_GURUS: Record<string, CoachGuru> = {
  'Tom Thibodeau':  { defGuru: true },
  'Hubie Brown':    { offOverride: 'C' },
  'Mike Fratello':  { defGuru: true },
  'Dwane Casey':    { defOverride: 'B' },
  'Nate McMillan':  { defOverride: 'B' },
  "Jerry Sloan*":   { defGuru: true },
  "Mike D'Antoni":  { offGuru: true, defOverride: 'D' },
  'Don Nelson*':    { offGuru: true, defOverride: 'C' },
  'Byron Scott':    { defOverride: 'C' },
  'Rick Carlisle':  { offOverride: 'B', defOverride: 'B' },
  'George Karl*':   { defOverride: 'C' },
  'Phil Jackson*':  { offGuru: true },
  'Danny Ainge':    { defOverride: 'B' },
  'Tex Winter':       { offGuru: true },
  'Rick Adelman*':    { offGuru: true },
  'Dick Motta':       { defGuru: true },
  'Larry Brown*':     { defGuru: true },
  'Chuck Daly*':      { defGuru: true },
  'Jeff Van Gundy':   { defGuru: true },
  'Gregg Popovich*':  { offGuru: true, defGuru: true },
  'Erik Spoelstra':   { offGuru: true, defGuru: true },
  'Pat Riley*':       { offGuru: true, defGuru: true },
  'Red Auerbach*':    { offGuru: true, defGuru: true },
  'Wes Unseld':       { offOverride: 'B', defOverride: 'A' },
  'Wes Unseld Jr.':   { offOverride: 'B', defOverride: 'A' },
  'Richie Guerin':    { offOverride: 'B', defOverride: 'B' },
  'Cotton Fitzsimmons': { offOverride: 'B', defOverride: 'C' },
  'Michael Malone':     { offOverride: 'A', defOverride: 'B' },
  'Stephen Silas':      { offOverride: 'F', defOverride: 'F' },
  'Kenny Atkinson':     { offOverride: 'A', defOverride: 'B' },
  'JJ Redick':          { defOverride: 'B' },
};

// Parse the coaches CSV into domain Coach objects. Logic is byte-for-byte identical to
// the original inline parser in page.tsx -- only relocated, not modified.
export function parseCoachesCSV(text: string): Coach[] {
  const lines = text.split('\n').filter(l => l.trim());
  const dataLines = lines.slice(3);
  const coaches: Coach[] = [];
  for (const line of dataLines) {
    const cols = line.split(',');
    if (!cols[1]?.trim() || cols[1].trim() === 'Coach') continue;
    const name = cols[1].trim();
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
    const guru = COACH_GURUS[name] ?? {};
    const regG = regW + regL;
    const isHOF = name.endsWith('*');
    const capF = (g: string) => (regG > 200 && g === 'F' ? 'C' : g);
    // HOF coaches get a minimum grade of B on data-derived grades (manual overrides win)
    const hofFloor = (g: string) => (isHOF && (g === 'C' || g === 'D' || g === 'F') ? 'B' : g);
    const rawOffGrade = guru.offGuru ? 'A' : guru.offOverride ?? (regWLPct >= 0.600 ? 'A' : regWLPct >= 0.550 ? 'B' : regWLPct >= 0.500 ? 'C' : regWLPct >= 0.450 ? 'D' : 'F');
    const rawDefGrade = guru.defGuru ? 'A' : guru.defOverride ?? (playoffG === 0 ? 'C' : playoffWLPct >= 0.550 ? 'A' : playoffWLPct >= 0.500 ? 'B' : playoffWLPct >= 0.450 ? 'C' : playoffWLPct >= 0.400 ? 'D' : 'F');
    const offGrade = (guru.offGuru || guru.offOverride ? rawOffGrade : hofFloor(capF(rawOffGrade))) as Coach['offGrade'];
    const defGrade = (guru.defGuru || guru.defOverride ? rawDefGrade : hofFloor(capF(rawDefGrade))) as Coach['defGrade'];
    const gradeN = (g: Coach['offGrade']) => ({ A: 4, B: 3, C: 2, D: 1, F: 0 }[g]);
    const avg = (gradeN(offGrade) + gradeN(defGrade)) / 2;
    const overallGrade = (avg >= 3.5 ? 'A' : avg >= 2.5 ? 'B' : avg >= 1.5 ? 'C' : avg >= 0.5 ? 'D' : 'F') as Coach['overallGrade'];
    if (name && (regG >= 100 || champ > 0)) coaches.push({ name, from, to, years: to - from, regG, regW, regL, regWLPct, playoffG, playoffW, playoffL, playoffWLPct, conf, champ, offGrade, defGrade, overallGrade, offGuru: !!guru.offGuru, defGuru: !!guru.defGuru });
  }
  return coaches;
}

// Load the player dataset, trying each source in order until one succeeds. Logs payload
// size and elapsed time. Throws only if every source fails (caller resets its load flag).
export async function loadPlayers(): Promise<Player[]> {
  const t = now();
  let lastErr: unknown = null;
  for (const src of PLAYER_SOURCES) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      const text = await res.text();
      const players = JSON.parse(text) as Player[];
      const ms = Math.round((now() - t) * 10) / 10;
      const bytes = text.length;
      // eslint-disable-next-line no-console
      console.log(`[PERF] data load: ${ms}ms, ${bytes}bytes (${src})`);
      return players;
    } catch (err) {
      lastErr = err;
      // Try the next source in the chain.
    }
  }
  throw lastErr ?? new Error('all player data sources failed');
}

// Load and parse the coaches dataset from the same-origin CSV.
export async function loadCoaches(): Promise<Coach[]> {
  const t = now();
  const res = await fetch(COACHES_SOURCE);
  const text = await res.text();
  const coaches = parseCoachesCSV(text);
  const ms = Math.round((now() - t) * 10) / 10;
  // eslint-disable-next-line no-console
  console.log(`[PERF] coaches load: ${ms}ms, ${text.length}bytes`);
  return coaches;
}

// Convenience: load both datasets in parallel (matches the original Promise.all shape).
export async function loadGameData(): Promise<{ players: Player[]; coaches: Coach[] }> {
  const [players, coaches] = await Promise.all([loadPlayers(), loadCoaches()]);
  return { players, coaches };
}
