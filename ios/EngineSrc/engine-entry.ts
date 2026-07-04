// EraBall iOS UI bridge.
//
// Runs inside JavaScriptCore. Wraps the REAL @eraball/engine (packages/engine) plus the
// exact UI orchestration the web app performs (team/era spin combos, the tag pipeline,
// coach CSV parsing with gurus + franchise pairs + S-grade, ratings, season/playoffs,
// season awards, and leaderboard scoring). Every rule here is a verbatim port of the web
// source — the engine math is NOT reimplemented, only invoked. Verified byte-for-byte
// against engine-snapshot/baseline.json.

import type {
  Player, Coach, CourtSlot, SlotPosition, Era, PlayerRating, PlayerSeasonStats, PlayoffResult,
} from '../../packages/engine/src/index'
import {
  withEraStats, applyFlexTag, applyRings, applySixthMan, applyFinalsMVP, applyAnchors,
  applyFloorGeneral, applyTimeless, applyShootingStar, applyGlassCleaner, applyDuo,
  SIXTH_MAN_PLAYERS, FRANCHISE_PAIRS, upgradeGrade,
  playerBaseRating, playerMatchesEra, playerTier, calcTS, calcFitPenalty, calcEraModifier,
  calcTeamRating, simulateSeason, simulatePlayoffs, genOppTeamStats, calcTeamDefTotals, calcRebFactor,
  coachChampBonus, effectiveCoachBonus,
  seedRng, clearRng,
  ALL_ERAS, SLOT_POSITIONS, SLOT_MPG, ERA_SEASON_GAMES, CAP_QUOTAS, firstRoundLabel,
  type PlayerTier, type OppTeamStats,
} from '../../packages/engine/src/index'
import { checkAchievements, getAllAchievements } from '../../lib/achievements'
import { recordRunComplete, getLifetimeStats, clearLifetimeStats } from '../../lib/lifetimeStats'

declare const globalThis: any

// ─── JavaScriptCore environment shims ────────────────────────────────────────
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

// ─── Verbatim: services/playerData.ts coach parser (gurus + HOF floor + S-grade) ──
type CoachGuru = { offGuru?: boolean; defGuru?: boolean; offOverride?: Coach['offGrade']; defOverride?: Coach['defGrade'] }
const COACH_GURUS: Record<string, CoachGuru> = {
  'Tom Thibodeau': { defGuru: true }, 'Hubie Brown': { offOverride: 'C' }, 'Mike Fratello': { defGuru: true },
  'Dwane Casey': { defOverride: 'B' }, 'Nate McMillan': { defOverride: 'B' }, "Jerry Sloan*": { defGuru: true },
  "Mike D'Antoni": { offGuru: true, defOverride: 'D' }, 'Don Nelson*': { offGuru: true, defOverride: 'C' },
  'Byron Scott': { defOverride: 'C' }, 'Rick Carlisle': { offOverride: 'B', defOverride: 'B' },
  'George Karl*': { defOverride: 'C' }, 'Phil Jackson*': { offGuru: true }, 'Danny Ainge': { defOverride: 'B' },
  'Tex Winter': { offGuru: true }, 'Rick Adelman*': { offGuru: true }, 'Dick Motta': { defGuru: true },
  'Larry Brown*': { defGuru: true }, 'Chuck Daly*': { defGuru: true }, 'Jeff Van Gundy': { defGuru: true },
  'Gregg Popovich*': { offGuru: true, defGuru: true }, 'Erik Spoelstra': { offGuru: true, defGuru: true },
  'Pat Riley*': { offGuru: true, defGuru: true }, 'Red Auerbach*': { offGuru: true, defGuru: true },
  'Wes Unseld': { offOverride: 'B', defOverride: 'A' }, 'Wes Unseld Jr.': { offOverride: 'B', defOverride: 'A' },
  'Richie Guerin': { offOverride: 'B', defOverride: 'B' }, 'Cotton Fitzsimmons': { offOverride: 'B', defOverride: 'C' },
  'Michael Malone': { offOverride: 'A', defOverride: 'B' }, 'Stephen Silas': { offOverride: 'F', defOverride: 'F' },
  'Kenny Atkinson': { offOverride: 'A', defOverride: 'B' }, 'JJ Redick': { defOverride: 'B' },
}

function parseCoachesCSV(text: string): Coach[] {
  const lines = text.split('\n').filter(l => l.trim())
  const dataLines = lines.slice(3)
  const coaches: Coach[] = []
  for (const line of dataLines) {
    const cols = line.split(',')
    if (!cols[1]?.trim() || cols[1].trim() === 'Coach') continue
    const name = cols[1].trim()
    const from = parseInt(cols[2]) || 0
    const to = parseInt(cols[3]) || 0
    const regW = parseInt(cols[6]) || 0
    const regL = parseInt(cols[7]) || 0
    const regWLPct = parseFloat(cols[8]) || 0
    const playoffG = parseInt(cols[10]) || 0
    const playoffW = parseInt(cols[11]) || 0
    const playoffL = parseInt(cols[12]) || 0
    const playoffWLPct = parseFloat(cols[13]) || 0
    const conf = parseInt(cols[14]) || 0
    const champ = parseInt(cols[15]) || 0
    const guru = COACH_GURUS[name] ?? {}
    const regG = regW + regL
    const isHOF = name.endsWith('*')
    const capF = (g: string) => (regG > 200 && g === 'F' ? 'C' : g)
    const hofFloor = (g: string) => (isHOF && (g === 'C' || g === 'D' || g === 'F') ? 'B' : g)
    const rawOffGrade = guru.offGuru ? 'A' : guru.offOverride ?? (regWLPct >= 0.600 ? 'A' : regWLPct >= 0.550 ? 'B' : regWLPct >= 0.500 ? 'C' : regWLPct >= 0.450 ? 'D' : 'F')
    const rawDefGrade = guru.defGuru ? 'A' : guru.defOverride ?? (playoffG === 0 ? 'C' : playoffWLPct >= 0.550 ? 'A' : playoffWLPct >= 0.500 ? 'B' : playoffWLPct >= 0.450 ? 'C' : playoffWLPct >= 0.400 ? 'D' : 'F')
    const offGrade = (guru.offGuru || guru.offOverride ? rawOffGrade : hofFloor(capF(rawOffGrade))) as Coach['offGrade']
    const defGrade = (guru.defGuru || guru.defOverride ? rawDefGrade : hofFloor(capF(rawDefGrade))) as Coach['defGrade']
    const gradeN = (g: Coach['offGrade']) => ({ S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }[g])
    const avg = (gradeN(offGrade) + gradeN(defGrade)) / 2
    const overallGrade = (avg >= 3.5 ? 'A' : avg >= 2.5 ? 'B' : avg >= 1.5 ? 'C' : avg >= 0.5 ? 'D' : 'F') as Coach['overallGrade']
    if (name && (regG >= 100 || champ > 0)) coaches.push({ name, from, to, years: to - from, regG, regW, regL, regWLPct, playoffG, playoffW, playoffL, playoffWLPct, conf, champ, offGrade, defGrade, overallGrade, offGuru: !!guru.offGuru, defGuru: !!guru.defGuru })
  }
  return coaches
}

// ─── Verbatim: DraftScreen team alias + tag pipeline ─────────────────────────
const TEAM_ALIAS: Record<string, string> = { 'SAN': 'SAS' }
const normalizeTeam = (t: string) => TEAM_ALIAS[t] ?? t

const tagPlayer = (p: Player, era: Era, team: string): Player =>
  applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyFloorGeneral(applyAnchors(applyFinalsMVP(applySixthMan(applyRings(applyFlexTag(withEraStats(p, era, team)))))))))))

function playerTeamForEra(player: Player, era: Era): string {
  return (player as any).teams_by_era?.[era] ?? player.team_abbreviation
}

// ─── Verbatim: lib/supabase.ts leaderboard score ─────────────────────────────
const GRADE_RANK: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }
type ScoreFlags = {
  no_timeless?: boolean; no_s_tier?: boolean; elite_spacing?: boolean; elite_rim?: boolean
  elite_playmaking?: boolean; reb_edge?: boolean; duo_pair?: boolean; duo_trio?: boolean
  bad_coach?: boolean; sixth_man_bench?: boolean
}
type LeaderboardEntryCore = {
  era: string; mode: 'normal' | 'salary_cap'; team_name: string | null
  reg_wins: number; reg_losses: number; reg_win_pct: number
  playoff_wins: number; playoff_losses: number; playoff_win_pct: number
  playoff_result: string | null; avg_pt_diff: number; team_rating: number
  coach_name: string | null; coach_grade: string | null
}
function calcLeaderboardScore(entry: LeaderboardEntryCore, flags?: ScoreFlags): number {
  const playoffBonus: Record<string, number> = { champion: 500, finals: 350, conf_finals: 175, second_round: 75, first_round: 25 }
  const bonus = entry.playoff_result ? (playoffBonus[entry.playoff_result] ?? 0) : 0
  const coachNum = entry.coach_grade ? (GRADE_RANK[entry.coach_grade] ?? 0) : 0
  const isChampion = entry.playoff_result === 'champion'
  let challengeBonus = 0
  if (isChampion) {
    if (flags?.no_timeless) challengeBonus += 75
    if (flags?.no_s_tier) challengeBonus += 225
    if (flags?.bad_coach) challengeBonus += 75
  }
  let teamBonus = 0
  if (flags?.elite_spacing) teamBonus += 40
  if (flags?.elite_rim) teamBonus += 50
  if (flags?.elite_playmaking) teamBonus += 40
  if (flags?.reb_edge) teamBonus += 25
  if (flags?.duo_pair) teamBonus += 30
  if (flags?.duo_trio) teamBonus += 65
  if (flags?.sixth_man_bench) teamBonus += 20
  return entry.reg_win_pct * 500 + entry.playoff_win_pct * 400 + entry.avg_pt_diff * 8 + entry.team_rating * 3 + coachNum * 20 + bonus + challengeBonus + teamBonus
}

// ─── Verbatim: SimulationScreen awards ───────────────────────────────────────
interface AwardThresholds {
  mvpWins: number; mvpBase: number; mvpPPG: number; allNBAAdj: number; allNBAPPG: number
  allStarAdj: number; allStarGPPG: number; allStarFPPG: number; allStarCPPG: number
  dpoyBase: number; dpoySTL: number; dpoyBLK: number; sixthManPPG: number; sixthManAdj: number
}
const DEFAULT_THRESHOLDS: AwardThresholds = {
  mvpWins: 50, mvpBase: 55, mvpPPG: 24, allNBAAdj: 50, allNBAPPG: 24,
  allStarAdj: 48, allStarGPPG: 20, allStarFPPG: 20, allStarCPPG: 18,
  dpoyBase: 50, dpoySTL: 1.5, dpoyBLK: 1.5, sixthManPPG: 14, sixthManAdj: 48,
}
interface AwardEntry { award: string; player: PlayerSeasonStats; justification: string; gold: boolean }

function computeSeasonAwards(seasonStats: PlayerSeasonStats[], playerRatings: PlayerRating[], wins: number, t: AwardThresholds): AwardEntry[] {
  const awards: AwardEntry[] = []
  const ratingMap = new Map(playerRatings.map(pr => [pr.player.person_id, pr]))
  const rated = seasonStats.map(s => ({ s, adj: ratingMap.get(s.player.person_id)?.adjusted ?? 0, base: ratingMap.get(s.player.person_id)?.base ?? 0 }))
  const starterSlots: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
  if (wins >= 78) {
    const topScorer = rated.filter(({ s }) => starterSlots.includes(s.slot) && s.PTS > 22).sort((a, b) => b.s.PTS - a.s.PTS)[0]
    if (topScorer) awards.push({ award: 'League MVP', player: topScorer.s, justification: `${topScorer.s.PTS.toFixed(1)} PPG - ${topScorer.s.REB.toFixed(1)} RPG - ${topScorer.s.AST.toFixed(1)} APG`, gold: true })
  } else if (wins >= t.mvpWins) {
    const ratedStarters = rated.filter(({ s }) => starterSlots.includes(s.slot))
    const tdCandidate = ratedStarters.find(({ s }) => (s.PTS > 20 && s.REB > 10 && s.AST > 10) || (s.PTS > 20 && s.AST > 10 && s.REB > 7))
    const mvpCandidate = tdCandidate ?? ratedStarters.filter(({ s, base }) => base > t.mvpBase && s.PTS > t.mvpPPG).sort((a, b) => b.base - a.base)[0]
    if (mvpCandidate) awards.push({ award: 'League MVP', player: mvpCandidate.s, justification: `${mvpCandidate.s.PTS.toFixed(1)} PPG - ${mvpCandidate.s.REB.toFixed(1)} RPG - ${mvpCandidate.s.AST.toFixed(1)} APG`, gold: true })
  }
  for (const pos of starterSlots) {
    const best = rated.filter(({ s, adj }) => s.slot === pos && adj > t.allNBAAdj && s.PTS > t.allNBAPPG).sort((a, b) => b.adj - a.adj)[0]
    if (best) awards.push({ award: `All-NBA - ${pos}`, player: best.s, justification: `${best.s.PTS.toFixed(1)} PPG - ${best.s.REB.toFixed(1)} RPG - ${best.s.AST.toFixed(1)} APG`, gold: false })
  }
  const seasonGames = seasonStats[0]?.GP ?? 82
  const winPct = wins / seasonGames
  const badTeam = winPct <= 0.35
  const ppgFloor = (s: PlayerSeasonStats) => {
    if (!s.slot.startsWith('B')) { const sl = s.slot as SlotPosition; return sl === 'PG' || sl === 'SG' ? t.allStarGPPG : sl === 'C' ? t.allStarCPPG : t.allStarFPPG }
    const pos = ((s.player as any).position ?? '').toUpperCase()
    if (pos.includes('CENTER')) return t.allStarCPPG
    if (pos.includes('GUARD')) return t.allStarGPPG
    return t.allStarFPPG
  }
  for (const { s } of rated) {
    if (badTeam && s.PTS < 30 && s.REB < 20 && s.AST < 18) continue
    if (s.REB >= 18) { awards.push({ award: 'All-Star', player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} REB`, gold: false }); continue }
    if (s.PTS <= ppgFloor(s)) continue
    const isCenter = s.slot === 'C' || (!s.slot.startsWith('B') ? false : ((s.player as any).position ?? '').toUpperCase().includes('CENTER'))
    if (isCenter && s.PTS < 20 && s.REB < 10) continue
    if (s.REB <= 7 && s.AST <= 7 && s.STL <= 1.8 && s.BLK <= 1.8) continue
    awards.push({ award: 'All-Star', player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} REB - ${s.AST.toFixed(1)} AST`, gold: false })
  }
  for (const { s } of rated) {
    if (s.PTS >= 30) { const already = awards.some(a => a.award === 'All-Star' && a.player.player.person_id === s.player.person_id); if (!already) awards.push({ award: 'All-Star', player: s, justification: `${s.PTS.toFixed(1)} PPG`, gold: false }) }
  }
  if (wins > 65) {
    const topScorer = [...rated].sort((a, b) => b.s.PTS - a.s.PTS)[0]
    const alreadyAllStar = awards.some(a => a.award === 'All-Star' && a.player.player.person_id === topScorer?.s.player.person_id)
    if (topScorer && !alreadyAllStar) awards.push({ award: 'All-Star', player: topScorer.s, justification: `${topScorer.s.PTS.toFixed(1)} PPG - ${topScorer.s.REB.toFixed(1)} RPG - ${topScorer.s.AST.toFixed(1)} APG`, gold: false })
  }
  if (wins >= 67) {
    for (const { s } of rated) {
      const alreadyAllStar = awards.some(a => a.award === 'All-Star' && a.player.player.person_id === s.player.person_id)
      if (alreadyAllStar) continue
      const qualifies = (s.PTS >= 19 && (s.AST >= 5 || s.STL >= 5 || s.BLK >= 5)) || (s.PTS >= 18 && s.REB >= 10)
      if (qualifies) awards.push({ award: 'All-Star', player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} RPG - ${s.AST.toFixed(1)} APG`, gold: false })
    }
  }
  const dpoy = rated.filter(({ s, base }) => base > t.dpoyBase && ((s.STL > t.dpoySTL && s.BLK > t.dpoyBLK) || s.STL > 2.2 || s.BLK > 2.8 || (s.BLK >= 2.5 && s.REB >= 12)))
    .sort((a, b) => (b.s.STL + b.s.BLK + b.s.REB * 0.15) - (a.s.STL + a.s.BLK + a.s.REB * 0.15))[0]
  if (dpoy) {
    const isBigManPath = dpoy.s.BLK >= 2.5 && dpoy.s.REB >= 12
    awards.push({ award: 'Defensive POY', player: dpoy.s, justification: isBigManPath ? `${dpoy.s.BLK.toFixed(1)} BLK - ${dpoy.s.REB.toFixed(1)} REB - ${dpoy.s.STL.toFixed(1)} STL` : `${dpoy.s.STL.toFixed(1)} STL - ${dpoy.s.BLK.toFixed(1)} BLK`, gold: false })
  }
  const benchSorted = rated.filter(({ s }) => s.slot.startsWith('B')).sort((a, b) => b.adj - a.adj)
  const sixthMan = benchSorted.slice(0, 2).find(({ s, adj }) => s.PTS > t.sixthManPPG && adj > t.sixthManAdj)
  if (sixthMan) awards.push({ award: '6th Man of the Year', player: sixthMan.s, justification: `${sixthMan.s.PTS.toFixed(1)} PPG - ${sixthMan.s.REB.toFixed(1)} RPG - ${sixthMan.s.AST.toFixed(1)} APG`, gold: false })
  return awards
}

function computeFinalsMVP(finalsStats: PlayerSeasonStats[]): PlayerSeasonStats | null {
  if (!finalsStats.length) return null
  const sorted = [...finalsStats].sort((a, b) => b.PTS !== a.PTS ? b.PTS - a.PTS : b.AST - a.AST)
  const eligible = sorted.filter(s => !s.slot.startsWith('B') || s.PTS >= 28 || s.REB >= 20)
  return eligible[0] ?? sorted[0]
}

// ─── Session state ────────────────────────────────────────────────────────────
let players: Player[] = []
let coaches: Coach[] = []
let allTeamsCache: string[] = []
let validCombosCache: { team: string; era: Era }[] = []
let simEra: Era = '20s'
let salaryCapMode = false
let slots: CourtSlot[] = emptySlots()
let draftedIds = new Set<string>()
let poolCache: Player[] = []
let currentCoach: Coach | null = null
let lastRatings: { teamRating: number; rawRating: number; playerRatings: PlayerRating[] } | null = null
let lastSimRaw = 0
let lastSeason: ReturnType<typeof simulateSeason> | null = null
let lastPlayoffs: PlayoffResult | null = null

function emptySlots(): CourtSlot[] {
  return SLOT_POSITIONS.map(p => ({ position: p, player: null, fitPenalty: 0, fitLabel: null }))
}
const STARTER_SLOTS: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
const capTier = (player: Player) => playerTier(playerBaseRating({ ...player, duoActiveCount: 0, sixthManActive: false } as Player, simEra))
function tierCounts(): Record<PlayerTier, number> {
  const counts: Record<PlayerTier, number> = { s: 0, a: 0, b: 0, c: 0, d: 0 }
  for (const s of slots) if (s.player) counts[capTier(s.player)]++
  return counts
}
function neededTiers(): PlayerTier[] {
  if (!salaryCapMode) return []
  const counts = tierCounts()
  return (Object.entries(CAP_QUOTAS) as [PlayerTier, number][]).filter(([t, q]) => counts[t] < q).map(([t]) => t)
}
// Verbatim: slotsWithDuo (activate duo + sixth man)
function activatedSlots(): CourtSlot[] {
  return slots.map(slot => {
    if (!slot.player) return slot
    const isSixthMan = SIXTH_MAN_PLAYERS.has(slot.player.full_name)
    if (!slot.player.duoPartners && !isSixthMan) return slot
    const duoActiveCount = slot.player.duoPartners
      ? slots.filter(s => s !== slot && s.player && slot.player!.duoPartners!.includes(s.player.full_name)).length
      : (slot.player.duoActiveCount ?? 0)
    const sixthManActive = isSixthMan && slot.position.startsWith('B')
    return { ...slot, player: { ...slot.player, duoActiveCount, sixthManActive } }
  })
}

// ─── View models ──────────────────────────────────────────────────────────────
function playerView(p: Player) {
  const base = playerBaseRating({ ...p, duoActiveCount: 0, sixthManActive: false } as Player, simEra)
  return {
    personId: String(p.person_id), fullName: p.full_name, position: (p as any).position ?? '',
    height: (p as any).height ?? '', weight: (p as any).weight ?? '',
    fromYear: (p as any).from_year ?? 0, toYear: (p as any).to_year ?? null,
    era: p.era, team: (p as any).eraTeam ?? p.team_abbreviation ?? '',
    GP: p.GP ?? 0, PTS: p.PTS ?? 0, REB: p.REB ?? 0, AST: p.AST ?? 0, STL: p.STL, BLK: p.BLK, TOV: p.TOV,
    FG_PCT: p.FG_PCT, FG3_PCT: p.FG3_PCT, FT_PCT: p.FT_PCT, TS_PCT: calcTS(p),
    base, tier: playerTier(base), greatest75: (p as any).greatest_75_flag === 'Y',
    timeless: !!p.timeless, offAnchor: !!p.offAnchor, defAnchor: !!p.defAnchor, anchorTier: p.anchorTier ?? 1,
    shootingStar: !!p.shootingStar, shootingStarTier: (p as any).shootingStarTier ?? 1, glassClean: !!p.glassClean,
    floorGeneral: !!(p as any).floorGeneral, flexPositions: (p as any).flexPositions ?? null,
    rings: p.rings ?? 0, finalsMVP: (p as any).finalsMVP ?? 0, sixthMan: SIXTH_MAN_PLAYERS.has(p.full_name),
    duoPartners: p.duoPartners ?? null, eraModifier: calcEraModifier(p, simEra),
  }
}
function slotView(s: CourtSlot, idx: number) {
  return { index: idx, position: s.position, player: s.player ? playerView(s.player) : null, fitPenalty: s.fitPenalty, fitLabel: s.fitLabel }
}
function stateView() {
  return { era: simEra, salaryCapMode, slots: slots.map(slotView), filledCount: slots.filter(s => s.player !== null).length, tierCounts: tierCounts(), neededTiers: neededTiers(), capQuotas: CAP_QUOTAS }
}
function coachView(c: Coach) {
  const draftedNames = new Set(slots.filter(s => s.player).map(s => s.player!.full_name))
  const fpPlayers = FRANCHISE_PAIRS[c.name] ?? []
  const franchisePair = fpPlayers.some(n => draftedNames.has(n))
  return {
    name: c.name.replace('*', ''), rawName: c.name, hof: c.name.endsWith('*'),
    from: c.from, to: c.to, years: c.years, regW: c.regW, regL: c.regL, regWLPct: c.regWLPct,
    playoffW: c.playoffW, playoffL: c.playoffL, playoffWLPct: c.playoffWLPct, playoffG: c.playoffG,
    conf: c.conf, champ: c.champ, offGrade: c.offGrade, defGrade: c.defGrade, overallGrade: c.overallGrade,
    offGuru: !!c.offGuru, defGuru: !!c.defGuru, franchisePair,
    effOffGrade: franchisePair ? upgradeGrade(c.offGrade) : c.offGrade,
    effDefGrade: franchisePair ? upgradeGrade(c.defGrade) : c.defGrade,
  }
}
function ratingView(pr: PlayerRating) {
  return { personId: String(pr.player.person_id), name: pr.player.full_name, slot: pr.slot, base: pr.base, adjusted: pr.adjusted, fitPenalty: pr.fitPenalty, eraMod: pr.eraMod, fitLabel: pr.fitLabel }
}
function seasonStatView(s: PlayerSeasonStats) {
  return { personId: String(s.player.person_id), name: s.player.full_name, slot: s.slot, GP: s.GP, MPG: s.MPG, PTS: s.PTS, REB: s.REB, AST: s.AST, STL: s.STL, BLK: s.BLK, TOV: s.TOV, FG_PCT: s.FG_PCT, FG3_PCT: s.FG3_PCT, FT_PCT: s.FT_PCT }
}

// ─── Run-completion flags (verbatim SimulationScreen) ────────────────────────
function computeDuoFlags(draftedPlayers: Player[]): { duo_pair: boolean; duo_trio: boolean } {
  const draftedNames = new Set(draftedPlayers.map(p => p.full_name))
  const duoAdj: Record<string, string[]> = {}
  for (const p of draftedPlayers) if (p.duoPartners) duoAdj[p.full_name] = p.duoPartners.filter(n => draftedNames.has(n))
  const duo_pair = draftedPlayers.some(p => (duoAdj[p.full_name]?.length ?? 0) > 0)
  let duo_trio = false
  if (duo_pair) {
    const visited = new Set<string>()
    for (const p of draftedPlayers) {
      if (visited.has(p.full_name) || !duoAdj[p.full_name]?.length) continue
      const queue = [p.full_name]; visited.add(p.full_name); let size = 0
      while (queue.length) { const curr = queue.shift()!; size++; for (const nb of duoAdj[curr] ?? []) if (!visited.has(nb)) { visited.add(nb); queue.push(nb) } }
      if (size >= 3) { duo_trio = true; break }
    }
  }
  return { duo_pair, duo_trio }
}
const BROTHER_PAIRS: [string, string][] = [
  ['Stephen Curry', 'Seth Curry'], ['Lonzo Ball', 'LaMelo Ball'],
  ['Giannis Antetokounmpo', 'Thanasis Antetokounmpo'], ['Giannis Antetokounmpo', 'Kostas Antetokounmpo'],
  ['Pau Gasol', 'Marc Gasol'], ['Brook Lopez', 'Robin Lopez'],
]

// ─── Public API (called from Swift) ───────────────────────────────────────────
const api = {
  loadPlayers(json: string): number {
    players = JSON.parse(json)
    const teams = new Set<string>()
    for (const p of players) {
      for (const teamList of Object.values((p as any).all_teams_by_era ?? {})) for (const t of (teamList as string[])) if (t) teams.add(normalizeTeam(t))
      for (const t of Object.values((p as any).teams_by_era ?? {})) if (t) teams.add(normalizeTeam(t as string))
      if (p.team_abbreviation) teams.add(normalizeTeam(p.team_abbreviation))
    }
    allTeamsCache = Array.from(teams).sort()
    const seen = new Set<string>()
    const combos: { team: string; era: Era }[] = []
    for (const p of players) {
      const allTeamsByEra = (p as any).all_teams_by_era
      if (allTeamsByEra && Object.keys(allTeamsByEra).length > 0) {
        for (const [era, teamList] of Object.entries(allTeamsByEra)) for (const team of (teamList as string[])) { if (!team) continue; const nt = normalizeTeam(team); const key = `${nt}:${era}`; if (!seen.has(key)) { seen.add(key); combos.push({ team: nt, era: era as Era }) } }
      } else {
        for (const [era, team] of Object.entries((p as any).teams_by_era ?? {})) { if (!team) continue; const nt = normalizeTeam(team as string); const key = `${nt}:${era}`; if (!seen.has(key)) { seen.add(key); combos.push({ team: nt, era: era as Era }) } }
      }
    }
    validCombosCache = combos
    return players.length
  },
  loadCoaches(csv: string): string { coaches = parseCoachesCSV(csv); return JSON.stringify(coaches.map(coachView)) },
  allTeams(): string { return JSON.stringify(allTeamsCache) },
  startGame(era: string, capMode: boolean): string {
    simEra = era as Era; salaryCapMode = capMode; slots = emptySlots(); draftedIds = new Set(); poolCache = []
    currentCoach = null; lastRatings = null; lastSeason = null; lastPlayoffs = null
    return JSON.stringify(stateView())
  },
  seasonGames(era: string): number { return ERA_SEASON_GAMES[era as Era] },
  firstRoundLabel(era: string): string { return firstRoundLabel(era as Era) },
  spin(eraFilterJSON: string): string {
    const spinEraFilter = new Set<Era>(JSON.parse(eraFilterJSON))
    const spinShouldFilter = spinEraFilter.size < ALL_ERAS.length
    const filteredCombos = spinShouldFilter ? validCombosCache.filter(c => spinEraFilter.has(c.era)) : validCombosCache
    if (filteredCombos.length === 0) return JSON.stringify({ noPlayers: true })
    const TIER_PRIORITY: PlayerTier[] = ['s', 'a', 'b', 'c', 'd']
    const ids = draftedIds
    let { team, era } = filteredCombos[Math.floor(Math.random() * filteredCombos.length)]
    const currentNeededTiers = neededTiers()
    const getPool = (t: string, e: Era) => players.filter(p => {
      const eraTeams = (p as any).all_teams_by_era?.[e] as string[] | undefined
      const onTeam = eraTeams ? eraTeams.map(normalizeTeam).includes(t) : normalizeTeam(playerTeamForEra(p, e)) === t
      return onTeam && playerMatchesEra(p, e) && !ids.has(String(p.person_id))
    })
    if (salaryCapMode && currentNeededTiers.length > 0) {
      const highestNeeded = TIER_PRIORITY.find(t => (currentNeededTiers as string[]).includes(t))
      const shuffled = [...filteredCombos].sort(() => Math.random() - 0.5)
      const checkTier = (p: Player, e: Era, t: string) => playerTier(playerBaseRating({ ...applyAnchors(withEraStats(p, e, t)), duoActiveCount: 0, sixthManActive: false } as Player, simEra))
      let found = false
      for (const combo of shuffled) { const pool = getPool(combo.team, combo.era); if (pool.length >= 3 && pool.some(p => checkTier(p, combo.era, combo.team) === highestNeeded)) { team = combo.team; era = combo.era; found = true; break } }
      if (!found) for (const combo of shuffled) { const pool = getPool(combo.team, combo.era); if (pool.length >= 3 && pool.some(p => (currentNeededTiers as string[]).includes(checkTier(p, combo.era, combo.team)))) { team = combo.team; era = combo.era; break } }
    }
    const pool = getPool(team, era)
    if (pool.length < 3) return JSON.stringify({ noPlayers: true, team, era })
    poolCache = [...pool].map(p => tagPlayer(p, era, team)).sort((a, b) => (b.PTS ?? 0) - (a.PTS ?? 0))
    return JSON.stringify({ noPlayers: false, team, era, pool: poolCache.map(playerView) })
  },
  fitPreview(personId: string): string {
    const p = poolCache.find(x => String(x.person_id) === personId)
    if (!p) return JSON.stringify({})
    const out: Record<string, { penalty: number; label: string | null }> = {}
    for (const pos of SLOT_POSITIONS) { const { penalty, label } = calcFitPenalty(p, pos); out[pos] = { penalty, label } }
    return JSON.stringify(out)
  },
  assign(slotIndex: number, personId: string): string {
    const selected = poolCache.find(x => String(x.person_id) === personId)
    if (!selected || slotIndex < 0 || slotIndex >= slots.length || slots[slotIndex].player) return JSON.stringify({ ok: false, error: 'Invalid pick.' })
    if (salaryCapMode) { const tier = capTier(selected); const counts = tierCounts(); if (counts[tier] >= CAP_QUOTAS[tier]) return JSON.stringify({ ok: false, error: `${tier.toUpperCase()} tier is full (${CAP_QUOTAS[tier]}/${CAP_QUOTAS[tier]}). Pick a different player.` }) }
    const { penalty, label } = calcFitPenalty(selected, slots[slotIndex].position)
    slots = slots.map((s, i) => i === slotIndex ? { ...s, player: selected, fitPenalty: penalty, fitLabel: label } : s)
    draftedIds = new Set([...draftedIds, String(selected.person_id)]); poolCache = []
    return JSON.stringify({ ok: true, state: stateView() })
  },
  remove(slotIndex: number): string {
    const p = slots[slotIndex]?.player
    if (p) { slots = slots.map((s, i) => i === slotIndex ? { ...s, player: null, fitPenalty: 0, fitLabel: null } : s); draftedIds.delete(String(p.person_id)) }
    return JSON.stringify({ ok: true, state: stateView() })
  },
  swap(fromIdx: number, toIdx: number): string {
    if (fromIdx !== toIdx) {
      const next = [...slots]; const fp = next[fromIdx].player; const tp = next[toIdx].player
      const a = fp ? calcFitPenalty(fp, next[toIdx].position) : { penalty: 0 as const, label: null }
      const b = tp ? calcFitPenalty(tp, next[fromIdx].position) : { penalty: 0 as const, label: null }
      next[toIdx] = { ...next[toIdx], player: fp, fitPenalty: a.penalty, fitLabel: a.label }
      next[fromIdx] = { ...next[fromIdx], player: tp, fitPenalty: b.penalty, fitLabel: b.label }
      slots = next
    }
    return JSON.stringify({ ok: true, state: stateView() })
  },
  state(): string { return JSON.stringify(stateView()) },
  eligibleCoaches(): string {
    const eligible = salaryCapMode ? coaches.filter(c => GRADE_RANK[c.overallGrade] >= 2) : coaches
    return JSON.stringify(eligible.map(coachView))
  },
  setCoach(rawName: string, from: number): string {
    const c = coaches.find(x => x.name === rawName && x.from === from) ?? coaches.find(x => x.name === rawName)
    if (!c) return JSON.stringify({ ok: false })
    currentCoach = c
    return JSON.stringify({ ok: true, coach: coachView(c) })
  },
  rateTeam(): string {
    if (!currentCoach) return JSON.stringify({ ok: false })
    const { teamRating: tr, rawRating, playerRatings: pr } = calcTeamRating(activatedSlots(), currentCoach, simEra)
    lastRatings = { teamRating: tr, rawRating, playerRatings: pr }; lastSimRaw = rawRating * (1 + coachChampBonus(currentCoach))
    return JSON.stringify({ ok: true, teamRating: tr, displayRating: Math.round(tr + 15), rawRating, playerRatings: pr.map(ratingView) })
  },
  runSeason(): string {
    if (!currentCoach || !lastRatings) return JSON.stringify({ ok: false })
    const coach = currentCoach, pr = lastRatings.playerRatings
    const result = simulateSeason(lastSimRaw, pr, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, 'def'), effectiveCoachBonus(coach, 'off'), salaryCapMode ? 0.90 : 1.0)
    lastSeason = result
    const { stl, blk } = calcTeamDefTotals(pr)
    const rebEntries = pr.map(r => ({ pr: r, minScale: SLOT_MPG[r.slot] / 35 }))
    const oppStats = genOppTeamStats(result.avgOppScore, simEra, stl, blk, calcRebFactor(rebEntries, simEra))
    const playoffThreshold = Math.ceil(ERA_SEASON_GAMES[simEra] / 2)
    const awards = computeSeasonAwards(result.seasonStats, pr, result.wins, DEFAULT_THRESHOLDS)
    return JSON.stringify({
      ok: true, wins: result.wins, losses: result.losses, games: result.games,
      seasonStats: result.seasonStats.map(seasonStatView), avgTeamScore: result.avgTeamScore, avgOppScore: result.avgOppScore,
      teamAnalysis: result.teamAnalysis, oppStats, madePlayoffs: result.wins >= playoffThreshold, playoffThreshold,
      awards: awards.map(a => ({ award: a.award, gold: a.gold, justification: a.justification, player: seasonStatView(a.player) })),
    })
  },
  runPlayoffs(): string {
    if (!currentCoach || !lastRatings || !lastSeason) return JSON.stringify({ ok: false })
    const coach = currentCoach, pr = lastRatings.playerRatings
    const result = simulatePlayoffs(lastSimRaw, pr, lastSeason.wins, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, 'def'), effectiveCoachBonus(coach, 'off'), salaryCapMode ? 0.90 : 1.0)
    lastPlayoffs = result
    const poAvgOpp = result.allGames.reduce((s, g) => s + g.oppScore, 0) / Math.max(1, result.allGames.length)
    const { stl, blk } = calcTeamDefTotals(pr)
    const rebEntries = pr.map(r => ({ pr: r, minScale: SLOT_MPG[r.slot] / 35 }))
    const oppStats = genOppTeamStats(poAvgOpp, simEra, stl, blk, calcRebFactor(rebEntries, simEra))
    const fmvp = result.champion && result.finalsStats.length > 0 ? computeFinalsMVP(result.finalsStats) : null
    return JSON.stringify({
      ok: true, rounds: result.rounds, champion: result.champion, allGames: result.allGames,
      playoffStats: result.playoffStats.map(seasonStatView), finalsStats: result.finalsStats.map(seasonStatView),
      oppStats, finalsMVP: fmvp ? seasonStatView(fmvp) : null,
    })
  },
  finishRun(teamName: string): string {
    if (!currentCoach || !lastRatings || !lastSeason) return JSON.stringify({ ok: false })
    const coach = currentCoach, tr = lastRatings.teamRating
    const wins = lastSeason.wins, losses = lastSeason.losses, playoffResult = lastPlayoffs, teamAnalysis = lastSeason.teamAnalysis
    const playoffThreshold = Math.ceil(ERA_SEASON_GAMES[simEra] / 2), madePlayoffs = wins >= playoffThreshold
    const starters = slots.slice(0, 5).filter(s => s.player).map(s => ({ personId: String(s.player!.person_id), name: s.player!.full_name }))
    const bench = slots.slice(5).filter(s => s.player).map(s => ({ personId: String(s.player!.person_id), name: s.player!.full_name }))
    const hasSTierStarter = slots.slice(0, 5).some(s => s.player && playerTier(playerBaseRating({ ...s.player, duoActiveCount: 0, sixthManActive: false } as Player, simEra)) === 's')
    const runMode: 'normal' | 'salary_cap' = salaryCapMode ? 'salary_cap' : 'normal'
    recordRunComplete({ era: simEra, wins, losses, champion: playoffResult?.champion ?? false, teamRating: Math.round(tr + 15), starters, bench, coach: coach.name, mode: runMode, hasSTierStarter })
    const draftedPlayers = slots.filter(s => s.player).map(s => s.player!)
    const { duo_pair, duo_trio } = computeDuoFlags(draftedPlayers)
    const draftedSlots = slots.filter(s => s.player)
    const glassCleanerCount = draftedSlots.filter(s => s.player!.glassClean).length
    const shootingStarCount = draftedSlots.filter(s => s.player!.shootingStar).length
    const draftedNameSet = new Set(draftedSlots.map(s => s.player!.full_name))
    const brotherDuo = BROTHER_PAIRS.some(([a, b]) => draftedNameSet.has(a) && draftedNameSet.has(b))
    const sixth_man_bench = slots.slice(5).some(s => s.player && SIXTH_MAN_PLAYERS.has(s.player.full_name))
    const newAchievements = checkAchievements(getLifetimeStats('normal'), getLifetimeStats('salary_cap'),
      { era: simEra, mode: runMode, wins, losses, champion: playoffResult?.champion ?? false, teamRating: Math.round(tr + 15), coachGrade: coach.overallGrade, hasSTierStarter, duo_pair, duo_trio, glassCleanerCount, shootingStarCount, brotherDuo, sixth_man_bench })
    const no_timeless = !draftedPlayers.some(p => p.timeless)
    const no_s_tier = !draftedPlayers.some(p => playerTier(playerBaseRating({ ...p, duoActiveCount: 0, sixthManActive: false } as Player, simEra)) === 's')
    const BLK_BASELINE = 3.5
    const elite_spacing = !teamAnalysis?.isPreThreePt && ((teamAnalysis?.spacingWinFactor ?? 1) - 1) * 100 >= 5
    const elite_rim = (teamAnalysis?.blkScore ?? 0) >= BLK_BASELINE * 1.5
    const elite_playmaking = ((teamAnalysis?.astFactor ?? 1) - 1) * 100 > 3
    const reb_edge = ((teamAnalysis?.rebFactor ?? 1) - 1) * 100 > 5
    const playoffWins = playoffResult ? playoffResult.rounds.reduce((s, r) => s + r.seriesWins, 0) : 0
    const playoffLosses = playoffResult ? playoffResult.rounds.reduce((s, r) => s + r.seriesLosses, 0) : 0
    const playoffTotal = playoffWins + playoffLosses
    const roundName = playoffResult?.rounds[playoffResult.rounds.length - 1]?.name
    const playoffResultKey = !madePlayoffs ? null : playoffResult?.champion ? 'champion' : roundName === 'NBA Finals' ? 'finals' : roundName === 'Conference Finals' ? 'conf_finals' : roundName === 'Semifinals' ? 'second_round' : 'first_round'
    const entry: LeaderboardEntryCore = {
      era: simEra, mode: runMode, team_name: teamName.trim() || null, reg_wins: wins, reg_losses: losses,
      reg_win_pct: wins / Math.max(wins + losses, 1), playoff_wins: playoffWins, playoff_losses: playoffLosses,
      playoff_win_pct: playoffTotal > 0 ? playoffWins / playoffTotal : 0, playoff_result: playoffResultKey,
      avg_pt_diff: Math.round((lastSeason.avgTeamScore - lastSeason.avgOppScore) * 100) / 100, team_rating: Math.round(tr),
      coach_name: coach.name.replace('*', ''), coach_grade: coach.overallGrade,
    }
    const bad_coach = playoffResultKey === 'champion' && entry.coach_grade === 'F'
    const flags: ScoreFlags = { no_timeless, no_s_tier, elite_spacing, elite_rim, elite_playmaking, reb_edge, duo_pair, duo_trio, bad_coach, sixth_man_bench }
    return JSON.stringify({ ok: true, score: Math.round(calcLeaderboardScore(entry, flags)), entry, flags, playoffResultKey, newAchievements })
  },
  lifetimeStats(mode: string): string { return JSON.stringify(getLifetimeStats(mode === 'salary_cap' ? 'salary_cap' : 'normal')) },
  clearAllLifetimeStats(): void { clearLifetimeStats('normal'); clearLifetimeStats('salary_cap') },
  allAchievements(): string { return JSON.stringify(getAllAchievements()) },
  // Deterministic control for tests / snapshot parity.
  seedRng(seed: number): void { seedRng(seed) },
  clearRng(): void { clearRng() },
}

globalThis.EraBall = api

// Raw engine facade — exposed for the byte-for-byte snapshot parity harness
// (engine-snapshot/baseline.json). Not used by the app; the UI goes through `api`.
globalThis.EraBallEngine = {
  withEraStats, applyFlexTag, applyRings, applyAnchors, applyTimeless, applyShootingStar,
  applyGlassCleaner, applyDuo, calcTeamRating, coachChampBonus, effectiveCoachBonus,
  simulateSeason, simulatePlayoffs, seedRng, clearRng,
}
