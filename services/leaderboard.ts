// services/leaderboard.ts
// Anti-corruption boundary for the leaderboard. The UI talks ONLY to this module --
// never to Supabase, /api/submit, or fetch directly. This isolates the external row
// shape and provides graceful degradation when no live backend is present.
//
// Behavior:
//   - Live backend reachable (Eshan's server-backed repo): real reads via the supabase
//     client and writes via the /api/submit route. Drop-in compatible.
//   - Backend absent/unreachable (fully-static fork): falls back to a bundled static
//     fixture (public/fake-leaderboard.json) and treats submits as local-only.
//
// Detection is failure-based, not config-based. NOTE: lib/supabase's fetch helpers
// swallow errors and return empty results, so we read through the raw client here and
// inspect the `error`/connection state ourselves to decide when to fall back. This
// keeps one code path working in both repos with zero build flags.
//
// [PERF] every external call is timed and logged as `[PERF] leaderboard.<op>: Xms (live|static)`.

import {
  supabase,
  calcLeaderboardScore,
  type LeaderboardEntry,
  type LeaderboardRoster,
  type ScoreFlags,
} from '../lib/supabase';

export type { LeaderboardEntry, LeaderboardRoster, ScoreFlags };
export type Mode = 'normal' | 'salary_cap';

// Result of a submit attempt. `local` is true when the static fallback handled it
// (no row was written to any remote backend).
export type SubmitResult = { score: number; rank: number; local: boolean };

// In-memory cache of the static fixture so we only fetch/parse it once.
let staticBoardCache: Record<string, LeaderboardEntry[]> | null = null;

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function logPerf(op: string, startMs: number, source: 'live' | 'static'): void {
  const ms = Math.round((now() - startMs) * 10) / 10;
  // eslint-disable-next-line no-console
  console.log(`[PERF] leaderboard.${op}: ${ms}ms (${source})`);
}

async function loadStaticBoard(): Promise<Record<string, LeaderboardEntry[]>> {
  if (staticBoardCache) return staticBoardCache;
  try {
    const res = await fetch('/fake-leaderboard.json');
    if (!res.ok) throw new Error('static board missing');
    staticBoardCache = (await res.json()) as Record<string, LeaderboardEntry[]>;
  } catch {
    // If even the fixture is absent, degrade to an empty board rather than throwing.
    staticBoardCache = {};
  }
  return staticBoardCache;
}

function bucketKey(era: string, mode: Mode): string {
  return `${era}_${mode}`;
}

// Public read API. Tries the live backend first; on any Supabase error or network
// failure returns the static fixture for the requested era/mode. Never throws.
export async function getLeaderboard(
  era: string,
  mode: Mode,
  limit = 50,
): Promise<LeaderboardEntry[]> {
  const t = now();
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('era', era)
      .eq('mode', mode)
      .order('score', { ascending: false })
      .limit(limit);
    if (error) throw error;
    logPerf('getLeaderboard', t, 'live');
    return (data ?? []) as LeaderboardEntry[];
  } catch {
    const board = await loadStaticBoard();
    logPerf('getLeaderboard', t, 'static');
    return (board[bucketKey(era, mode)] ?? []).slice(0, limit);
  }
}

// Compute the rank a given score would hold. Live path uses Supabase's exact count
// query; static path counts fixture rows with a strictly greater score.
export async function getScoreRank(
  era: string,
  mode: Mode,
  score: number,
): Promise<number> {
  const t = now();
  try {
    const { count, error } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('era', era)
      .eq('mode', mode)
      .gt('score', score);
    if (error) throw error;
    logPerf('getScoreRank', t, 'live');
    return (count ?? 0) + 1;
  } catch {
    const board = await loadStaticBoard();
    logPerf('getScoreRank', t, 'static');
    const rows = board[bucketKey(era, mode)] ?? [];
    return rows.filter(r => r.score > score).length + 1;
  }
}

// Submit a run. Live path posts to /api/submit (server recomputes + validates + writes).
// Static path computes the score locally (identical formula) and returns a local-only
// result; nothing is written remotely. The caller still persists to localStorage either way.
export async function submitEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'score' | 'created_at'>,
  roster: LeaderboardRoster,
  flags: ScoreFlags,
): Promise<SubmitResult> {
  const t = now();
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, roster, flags }),
    });
    if (!res.ok) throw new Error('submit endpoint unavailable');
    const { score, rank } = (await res.json()) as { score: number; rank: number };
    logPerf('submitEntry', t, 'live');
    return { score, rank, local: false };
  } catch {
    // No backend: compute the score with the identical formula and rank against the
    // static fixture so the user still sees a meaningful result.
    const score = calcLeaderboardScore({ ...entry, roster }, flags);
    const rank = await getScoreRank(entry.era, entry.mode as Mode, score);
    logPerf('submitEntry', t, 'static');
    return { score, rank, local: true };
  }
}
