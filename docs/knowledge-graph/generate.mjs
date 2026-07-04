// Generates a curated Understand-Anything knowledge graph for EraBall.
// Schema: packages/core/src/types.ts (KnowledgeGraph). Hand-authored summaries so the
// dashboard teaches how the pieces fit together rather than dumping raw AST.
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// docs/knowledge-graph/generate.mjs → repo root is two levels up.
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const commit = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim()

const N = [] // nodes
const E = [] // edges
const node = (id, type, name, filePath, summary, tags, complexity = 'moderate') =>
  (N.push({ id, type, name, filePath, summary, tags, complexity }), id)
const edge = (source, target, type, description, direction = 'forward', weight = 0.8) =>
  E.push({ source, target, type, direction, description, weight })

// ─── Layer 1: Simulation Engine (the bread and butter) ───────────────────────
const engine   = node('module:packages/engine', 'module', '@eraball/engine', 'packages/engine/src/index.ts',
  'The single source of truth for all game math. A framework-free, seedable simulation engine behind a small public facade. Everything the web app and the iOS app compute goes through here — nothing is reimplemented.', ['engine','facade','core'], 'complex')
const gameLogic = node('file:packages/engine/src/gameLogic.ts', 'file', 'gameLogic.ts', 'packages/engine/src/gameLogic.ts',
  '2,100 lines of the actual basketball math: era modifiers, positional fit penalties, player base ratings, anchors/duos/tags, proportional stat distribution, season and playoff simulation, and season awards.', ['engine','simulation'], 'complex')
const orchestrator = node('file:packages/engine/src/orchestrator.ts', 'file', 'orchestrator.ts', 'packages/engine/src/orchestrator.ts',
  'High-level entry points runGame() and rateTeam(). Composes calcTeamRating → champ-bonus simRaw → simulateSeason → simulatePlayoffs in the exact order the UI used, so any consumer can run a full game in one call.', ['engine','orchestration'], 'moderate')
const rng = node('file:packages/engine/src/rng.ts', 'file', 'rng.ts', 'packages/engine/src/rng.ts',
  'A seedable random source (mulberry32). Unseeded it delegates to Math.random() (identical to production); seeded it makes a full simulation reproducible — which is what makes byte-for-byte parity testing possible.', ['engine','determinism','testing'], 'simple')
const fRate = node('function:packages/engine/src/gameLogic.ts:calcTeamRating', 'function', 'calcTeamRating()', 'packages/engine/src/gameLogic.ts',
  'Turns a 9-player roster + coach + era into a team rating. Averages starter/bench adjusted ratings (70/30), then applies coach off/def bonuses and championship bonus.', ['engine','rating'])
const fSeason = node('function:packages/engine/src/gameLogic.ts:simulateSeason', 'function', 'simulateSeason()', 'packages/engine/src/gameLogic.ts',
  'Simulates a full regular season game-by-game (72–82 games by era), then distributes each player\'s stats proportionally from the actual simulated team scores so the box score always adds up.', ['engine','simulation'], 'complex')
const fPlayoffs = node('function:packages/engine/src/gameLogic.ts:simulatePlayoffs', 'function', 'simulatePlayoffs()', 'packages/engine/src/gameLogic.ts',
  'Runs the best-of-7 bracket with round/seed-scaled opponents, ring-boosted win odds, special performances, and a Finals MVP. Requires 41+ regular-season wins to qualify.', ['engine','playoffs'], 'complex')
const fBase = node('function:packages/engine/src/gameLogic.ts:playerBaseRating', 'function', 'playerBaseRating()', 'packages/engine/src/gameLogic.ts',
  'The single-number player value from era-adjusted stats: PTS/REB/AST/TS%/3P plus anchor, top-75, sixth-man and duo bonuses. Feeds the salary-cap tier (S/A/B/C/D).', ['engine','rating'])
const fEraMod = node('function:packages/engine/src/gameLogic.ts:calcEraModifier', 'function', 'calcEraModifier()', 'packages/engine/src/gameLogic.ts',
  'The cross-era penalty: a player drafted outside their native decade loses effectiveness by era distance and direction (forward vs backward), with carve-outs for Timeless players and tall centers.', ['engine','era'])
const fFit = node('function:packages/engine/src/gameLogic.ts:calcFitPenalty', 'function', 'calcFitPenalty()', 'packages/engine/src/gameLogic.ts',
  'The positional-fit penalty: 0% at a natural slot, −10% one position off, −25% way out of position. FLEX players and position locks override the default adjacency rules.', ['engine','position'])
const tagPipe = node('concept:tag-pipeline', 'concept', 'Tag Pipeline', 'packages/engine/src/gameLogic.ts',
  'The ordered transform every raw player passes through before rating: withEraStats → applyFlexTag → applyRings → applySixthMan → applyFinalsMVP → applyAnchors → applyFloorGeneral → applyTimeless → applyShootingStar → applyGlassCleaner → applyDuo. Order matters and is identical on web and iOS.', ['engine','tags','pipeline'], 'complex')
const baseline = node('config:engine-snapshot/baseline.json', 'schema', 'baseline.json (behavior lock)', 'engine-snapshot/baseline.json',
  'A byte-stable snapshot of engine output for a fixed roster/coach across all 8 eras × 2 cap modes at seed 1234567. Any divergence means the engine math changed — the regression tripwire.', ['engine','testing','snapshot'])

for (const f of [gameLogic, orchestrator, rng, fRate, fSeason, fPlayoffs, fBase, fEraMod, fFit]) edge(engine, f, 'contains', 'facade re-exports')
edge(orchestrator, fRate, 'calls'); edge(orchestrator, fSeason, 'calls'); edge(orchestrator, fPlayoffs, 'calls')
edge(fSeason, rng, 'calls', 'randomness'); edge(fPlayoffs, rng, 'calls', 'randomness')
edge(fRate, fBase, 'calls'); edge(fRate, fEraMod, 'calls'); edge(fRate, fFit, 'calls')
edge(fBase, tagPipe, 'depends_on', 'reads tag flags'); edge(gameLogic, tagPipe, 'contains')
edge(baseline, engine, 'tested_by', 'byte-for-byte lock', 'backward')

// ─── Layer 2: iOS Engine Bridge (runs the SAME engine) ───────────────────────
const entry = node('file:ios/EngineSrc/engine-entry.ts', 'file', 'engine-entry.ts (UI bridge)', 'ios/EngineSrc/engine-entry.ts',
  'The JavaScript the iOS app runs. Wraps the real @eraball/engine plus the exact web UI orchestration (spin combos, tag pipeline, coach CSV parsing, awards, leaderboard scoring) and exposes a command API to Swift.', ['ios','bridge','javascript'], 'complex')
const enginejs = node('resource:ios/EraBall/Resources/engine.js', 'resource', 'engine.js (bundle)', 'ios/EraBall/Resources/engine.js',
  'esbuild bundle of engine-entry.ts shipped in the app. Verified byte-for-byte against baseline.json, so the iOS app provably runs the identical simulation to eraball.com.', ['ios','bundle'])
const swiftEngine = node('file:ios/EraBall/Core/Engine.swift', 'file', 'Engine.swift (JSC bridge)', 'ios/EraBall/Core/Engine.swift',
  'The Swift side: hosts engine.js in a JavaScriptCore context and exposes typed Codable methods (combos, pool, rateTeam, runSeason, runPlayoffs, awards). No game math lives in Swift.', ['ios','swift','bridge'], 'complex')
const jscParity = node('concept:jsc-parity', 'concept', 'Byte-for-byte parity', null,
  'The core guarantee: the iOS app does not reimplement the engine — it executes the same TypeScript engine inside JavaScriptCore, proven identical to the web via the seeded snapshot.', ['ios','correctness','parity'])
edge(entry, engine, 'imports', 'runs the real engine')
edge(enginejs, entry, 'transforms', 'esbuild bundle', 'backward')
edge(swiftEngine, enginejs, 'depends_on', 'loads into JSContext')
edge(enginejs, baseline, 'tested_by', 'parity proof', 'backward')
edge(jscParity, swiftEngine, 'related'); edge(jscParity, enginejs, 'related')

// ─── Layer 3: iOS App (SwiftUI screens) ──────────────────────────────────────
const iosApp = node('file:ios/EraBall/EraBallApp.swift', 'file', 'EraBallApp.swift', 'ios/EraBall/EraBallApp.swift',
  'App entry + RootView phase router (loading → eraSelect → draft → coachDraft → simulation), driven by GameSession. Wires the Game Center sign-in sheet.', ['ios','swift','app'])
const gameSession = node('concept:GameSession', 'concept', 'GameSession (state machine)', 'ios/EraBall/Core/GameSession.swift',
  'The observable object that drives the whole flow: holds era/roster/coach, runs spin choreography, and calls Engine.swift for every rule and simulation.', ['ios','state'], 'complex')
const iosEra   = node('file:ios/EraBall/Views/EraSelectView.swift', 'file', 'EraSelectView', 'ios/EraBall/Views/EraSelectView.swift', 'Era-select menu — port of the web EraSelection: banner art, era grid, Normal/Salary-Cap/Sandbox, and the menu (How to Play, Leaderboard, Lifetime Stats, Achievements, What\'s New, Supporters).', ['ios','screen'])
const iosDraft = node('file:ios/EraBall/Views/DraftView.swift', 'file', 'DraftView', 'ios/EraBall/Views/DraftView.swift', 'Player draft — spin a team+era, pick from the pool into 5 starters + 4 bench, with fit penalties and salary-cap tier quotas.', ['ios','screen'], 'complex')
const iosCoach = node('file:ios/EraBall/Views/CoachDraftView.swift', 'file', 'CoachDraftView', 'ios/EraBall/Views/CoachDraftView.swift', 'Coach draft — one spin reveals three coaches; pick one. Shows gurus, franchise-pair upgrades, and S–F grades.', ['ios','screen'])
const iosSim   = node('file:ios/EraBall/Views/SimulationView.swift', 'file', 'SimulationView', 'ios/EraBall/Views/SimulationView.swift', 'Season ticker, box scores, awards, playoff bracket, and the result/leaderboard submission.', ['ios','screen'], 'complex')
const iosModals= node('file:ios/EraBall/Views/Modals.swift', 'file', 'Modals.swift', 'ios/EraBall/Views/Modals.swift', 'HowToPlay, PatchNotes (What\'s New), and the Supporters "Hall of Fame" sheet — kept in sync with the web modal content.', ['ios','modal'])
const iosGC    = node('file:ios/EraBall/Core/GameCenterManager.swift', 'file', 'GameCenterManager', 'ios/EraBall/Core/GameCenterManager.swift', 'Game Center: authentication, per-era + friends leaderboards, and achievement reporting via GameKit. Degrades gracefully when signed out.', ['ios','gamecenter'])
const iosTheme = node('file:ios/EraBall/Components/Theme.swift', 'file', 'Theme.swift (tokens)', 'ios/EraBall/Components/Theme.swift', 'Design tokens matching the web tokens.ts: the G color palette, Bebas type, spacing/radius scale, button styles, and tag/tier/grade palettes.', ['ios','design','tokens'])
edge(iosApp, gameSession, 'depends_on'); edge(gameSession, swiftEngine, 'calls', 'every rule + sim')
for (const s of [iosEra, iosDraft, iosCoach, iosSim]) { edge(iosApp, s, 'contains', 'phase router'); edge(s, gameSession, 'depends_on') }
edge(iosEra, iosModals, 'contains', 'sheets'); edge(iosSim, iosGC, 'calls', 'submit score')
for (const s of [iosEra, iosDraft, iosCoach, iosSim, iosModals]) edge(s, iosTheme, 'depends_on', 'tokens')

// ─── Layer 4: Web App (parity source of truth for screens) ───────────────────
const webRouter = node('file:app/page.tsx', 'file', 'page.tsx (router)', 'app/page.tsx', 'Thin 497-line Next.js router: composes the four feature screens and owns era-audio only.', ['web','router'])
const webEra   = node('file:app/features/era-selection/EraSelection.tsx', 'file', 'EraSelection.tsx', 'app/features/era-selection/EraSelection.tsx', 'Web era-select screen — the layout/copy the iOS EraSelectView is ported from.', ['web','screen'])
const webDraft = node('file:app/features/draft/DraftScreen.tsx', 'file', 'DraftScreen.tsx', 'app/features/draft/DraftScreen.tsx', 'Web draft screen — owns the tag taxonomy (TAG_OPTIONS), team alias, and spin/pool logic ported into the iOS bridge.', ['web','screen'], 'complex')
const webCoach = node('file:app/features/coach-draft/CoachDraftScreen.tsx', 'file', 'CoachDraftScreen.tsx', 'app/features/coach-draft/CoachDraftScreen.tsx', 'Web coach draft — the spin-reveals-3 flow with guru/franchise/S-grade badges.', ['web','screen'])
const webSim   = node('file:app/features/simulation/SimulationScreen.tsx', 'file', 'SimulationScreen.tsx', 'app/features/simulation/SimulationScreen.tsx', 'Web simulation — owns awards math, playoff reactions, thresholds, and leaderboard flags ported into the iOS bridge.', ['web','screen'], 'complex')
edge(webRouter, webEra, 'contains'); edge(webRouter, webDraft, 'contains'); edge(webRouter, webCoach, 'contains'); edge(webRouter, webSim, 'contains')
edge(webEra, engine, 'depends_on'); edge(webDraft, engine, 'depends_on'); edge(webCoach, engine, 'depends_on'); edge(webSim, engine, 'depends_on')
edge(iosEra, webEra, 'similar_to', 'iOS port of', 'bidirectional', 0.9)
edge(iosDraft, webDraft, 'similar_to', 'iOS port of', 'bidirectional', 0.9)
edge(iosCoach, webCoach, 'similar_to', 'iOS port of', 'bidirectional', 0.9)
edge(iosSim, webSim, 'similar_to', 'iOS port of', 'bidirectional', 0.9)
edge(entry, webDraft, 'depends_on', 'ports spin/pool + tags'); edge(entry, webSim, 'depends_on', 'ports awards + flags')

// ─── Layer 5: Shared Data & Services ─────────────────────────────────────────
const svcData = node('service:services/playerData.ts', 'service', 'playerData.ts', 'services/playerData.ts', 'Anti-corruption boundary for the datasets: loads the 5MB player JSON (local→R2→worker fallback) and parses coaches.csv into Coach objects (with the gurus overrides).', ['data','service'])
const svcLb   = node('service:services/leaderboard.ts', 'service', 'leaderboard.ts', 'services/leaderboard.ts', 'Leaderboard submit/read: live /api/submit when a backend is reachable, else a local score+rank with the identical formula.', ['data','service'])
const players = node('resource:public/players_with_stats.json', 'resource', 'players_with_stats.json', 'public/players_with_stats.json', 'The ~4,560-player dataset with per-era, per-team stat splits. Gates the draft; hosted on R2 for the web, bundled for iOS.', ['data'])
const coaches = node('resource:public/coaches.csv', 'resource', 'coaches.csv', 'public/coaches.csv', 'Real NBA coaching records; parsed into grades (with HOF floor, gurus, and franchise-pair upgrades).', ['data'])
const ach     = node('file:lib/achievements.ts', 'file', 'achievements.ts', 'lib/achievements.ts', 'Achievement definitions + checks, evaluated after each run against lifetime stats. Shared verbatim by web and the iOS bridge.', ['data','achievements'])
const life    = node('file:lib/lifetimeStats.ts', 'file', 'lifetimeStats.ts', 'lib/lifetimeStats.ts', 'Persistent per-mode lifetime stats (localStorage on web; UserDefaults-backed shim in JavaScriptCore on iOS).', ['data','stats'])
edge(svcData, players, 'reads_from'); edge(svcData, coaches, 'reads_from')
edge(webDraft, svcData, 'depends_on'); edge(entry, svcData, 'depends_on', 'same parser inlined')
edge(entry, ach, 'imports'); edge(entry, life, 'imports')
edge(webSim, svcLb, 'depends_on'); edge(iosGC, svcLb, 'related', 'GC leaderboards mirror score')

// ─── Layers ──────────────────────────────────────────────────────────────────
const layer = (id, name, description, ids) => ({ id, name, description, nodeIds: ids })
const layers = [
  layer('l:engine', 'Simulation Engine', 'The framework-free game math — the single source of truth every platform runs.', [engine,gameLogic,orchestrator,rng,fRate,fSeason,fPlayoffs,fBase,fEraMod,fFit,tagPipe,baseline]),
  layer('l:bridge', 'iOS Engine Bridge', 'How iOS runs the exact same engine via JavaScriptCore — proven byte-for-byte.', [entry,enginejs,swiftEngine,jscParity]),
  layer('l:ios', 'iOS App (SwiftUI)', 'The native screens, state machine, tokens, and Game Center.', [iosApp,gameSession,iosEra,iosDraft,iosCoach,iosSim,iosModals,iosGC,iosTheme]),
  layer('l:web', 'Web App (parity source)', 'The Next.js feature screens the iOS screens are ported from.', [webRouter,webEra,webDraft,webCoach,webSim]),
  layer('l:data', 'Shared Data & Services', 'Datasets, dataset loaders, leaderboard, achievements, lifetime stats.', [svcData,svcLb,players,coaches,ach,life]),
  layer('l:parity', 'Correctness & Parity', 'The seeded RNG + snapshot baseline that lock web and iOS to identical behavior.', [rng,baseline,jscParity,enginejs]),
]

// ─── Guided tour (onboarding path) ───────────────────────────────────────────
const tour = [
  { order: 1, title: 'Start with the engine', description: 'EraBall is an NBA draft simulator. Everything — web and iOS — runs one framework-free engine. Read this first; the UI is just a shell around it.', nodeIds: [engine, gameLogic] },
  { order: 2, title: 'How a full game runs', description: 'runGame() composes rating → season → playoffs in a fixed order. This is the one call a consumer needs.', nodeIds: [orchestrator, fRate, fSeason, fPlayoffs] },
  { order: 3, title: 'The tag pipeline', description: 'Before any rating, a raw player is transformed through an ordered set of tag functions. The order is load-bearing and identical everywhere.', nodeIds: [tagPipe, fBase, fEraMod, fFit] },
  { order: 4, title: 'iOS runs the SAME engine', description: 'The iOS app does not reimplement the math — it bundles the real engine and executes it in JavaScriptCore, proven byte-for-byte via a seeded snapshot.', nodeIds: [entry, enginejs, jscParity, baseline] },
  { order: 5, title: 'The Swift bridge', description: 'Engine.swift hosts engine.js and exposes typed methods. GameSession calls it for every rule and simulation.', nodeIds: [swiftEngine, gameSession] },
  { order: 6, title: 'The iOS screens', description: 'Four phases — era select → draft → coach → simulate — each a native SwiftUI port of the matching web feature screen.', nodeIds: [iosEra, iosDraft, iosCoach, iosSim] },
  { order: 7, title: 'Web parity source', description: 'The web feature screens are the design/behavior source of truth the iOS screens are matched against.', nodeIds: [webEra, webDraft, webCoach, webSim] },
  { order: 8, title: 'Data, services & Game Center', description: 'Where the players/coaches come from, how leaderboards and achievements work, and the Game Center integration.', nodeIds: [svcData, players, coaches, iosGC] },
]

const graph = {
  version: '1.0.0', kind: 'codebase',
  project: {
    name: 'EraBall',
    languages: ['TypeScript', 'Swift', 'JavaScript'],
    frameworks: ['Next.js', 'SwiftUI', 'JavaScriptCore', 'GameKit', '@eraball/engine'],
    description: 'NBA cross-era draft simulator. A Next.js web app and a native SwiftUI iOS port that both run one shared, seedable simulation engine — the iOS app executes the identical engine in JavaScriptCore, verified byte-for-byte.',
    analyzedAt: new Date().toISOString(), gitCommitHash: commit,
  },
  nodes: N, edges: E, layers, tour,
}

mkdirSync(REPO + '/.understand-anything', { recursive: true })
writeFileSync(REPO + '/.understand-anything/knowledge-graph.json', JSON.stringify(graph, null, 2))
console.log(`wrote knowledge-graph.json: ${N.length} nodes, ${E.length} edges, ${layers.length} layers, ${tour.length} tour steps`)
