// EraBall iOS engine entry.
// Bundles the REAL @eraball/engine (packages/engine) into a single IIFE global so
// JavaScriptCore runs byte-for-byte the same simulation as eraball.com. NOTHING in
// the engine is reimplemented — this only re-exports the canonical facade plus the
// UI-side helpers (achievements, lifetime stats, leaderboard score) the app needs.

import * as Engine from '../../packages/engine/src/index'
import { checkAchievements, getAllAchievements } from '../../lib/achievements'
import { recordRunComplete, getLifetimeStats, clearLifetimeStats } from '../../lib/lifetimeStats'
import { calcLeaderboardScore } from '../../lib/supabase'

declare const globalThis: any

// Console/localStorage shims for JavaScriptCore (harmless in Node too).
if (typeof globalThis.console === 'undefined') {
  const log = typeof globalThis.__nativeLog === 'function' ? globalThis.__nativeLog : () => {}
  globalThis.console = { log, warn: log, error: log, info: log, debug: log }
}
if (typeof globalThis.localStorage === 'undefined') {
  const native = globalThis.__nativeStorage
  const mem = new Map<string, string>()
  globalThis.localStorage = native ? {
    getItem: (k: string) => { const v = native.getItem(k); return v == null ? null : String(v) },
    setItem: (k: string, v: string) => native.setItem(k, String(v)),
    removeItem: (k: string) => native.removeItem(k),
  } : {
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k: string, v: string) => { mem.set(k, String(v)) },
    removeItem: (k: string) => { mem.delete(k) },
  }
}

// Expose the entire engine facade plus UI helpers under one global.
globalThis.EraBallEngine = {
  ...Engine,
  checkAchievements,
  getAllAchievements,
  recordRunComplete,
  getLifetimeStats,
  clearLifetimeStats,
  calcLeaderboardScore,
}
