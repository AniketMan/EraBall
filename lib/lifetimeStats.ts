export interface EraRecord { wins: number; losses: number }

export interface LifetimeStats {
  draftsCompleted:    number
  totalWins:          number
  totalLosses:        number
  championshipsTotal: number
  recordByEra:        Partial<Record<string, EraRecord>>
  championshipsByEra: Partial<Record<string, number>>
  bestRecord:         { wins: number; losses: number; era: string } | null
  bestRecordByEra:    Partial<Record<string, EraRecord>>
  worstRecord:        { wins: number; losses: number; era: string } | null
  worstRecordByEra:   Partial<Record<string, EraRecord>>
  playerDraftCounts:  Record<string, { name: string; count: number }>
  coachDraftCounts:   Record<string, { name: string; count: number }>
  eraSpinCount:       Partial<Record<string, number>>
  highestTeamRating:  { rating: number; era: string } | null
}

const KEYS: Record<'normal' | 'salary_cap', string> = {
  normal:     'eraball_lifetime_stats',
  salary_cap: 'eraball_lifetime_stats_cap',
}

function defaults(): LifetimeStats {
  return {
    draftsCompleted: 0, totalWins: 0, totalLosses: 0, championshipsTotal: 0,
    recordByEra: {}, championshipsByEra: {}, bestRecord: null,
    bestRecordByEra: {}, worstRecord: null, worstRecordByEra: {}, playerDraftCounts: {}, coachDraftCounts: {}, eraSpinCount: {}, highestTeamRating: null,
  }
}

export function getLifetimeStats(mode: 'normal' | 'salary_cap' = 'normal'): LifetimeStats {
  try {
    const raw = localStorage.getItem(KEYS[mode])
    if (!raw) return defaults()
    return { ...defaults(), ...JSON.parse(raw) }
  } catch { return defaults() }
}

function save(s: LifetimeStats, mode: 'normal' | 'salary_cap') {
  try { localStorage.setItem(KEYS[mode], JSON.stringify(s)) } catch {}
}

export function recordRunComplete(params: {
  era: string
  wins: number
  losses: number
  champion: boolean
  teamRating: number
  players: { personId: string; name: string }[]
  coach: string
  mode?: 'normal' | 'salary_cap'
}) {
  const { era, wins, losses, champion, teamRating, players, coach, mode = 'normal' } = params
  const s = getLifetimeStats(mode)

  s.draftsCompleted++
  s.totalWins += wins
  s.totalLosses += losses
  s.eraSpinCount[era] = (s.eraSpinCount[era] ?? 0) + 1

  if (champion) {
    s.championshipsTotal++
    s.championshipsByEra[era] = (s.championshipsByEra[era] ?? 0) + 1
  }

  const eraRec = s.recordByEra[era] ?? { wins: 0, losses: 0 }
  eraRec.wins += wins; eraRec.losses += losses
  s.recordByEra[era] = eraRec

  if (!s.bestRecord || wins > s.bestRecord.wins)
    s.bestRecord = { wins, losses, era }

  const bestEra = s.bestRecordByEra[era]
  if (!bestEra || wins > bestEra.wins)
    s.bestRecordByEra[era] = { wins, losses }

  if (!s.worstRecord || losses > s.worstRecord.losses)
    s.worstRecord = { wins, losses, era }

  const worstEra = s.worstRecordByEra[era]
  if (!worstEra || losses > worstEra.losses)
    s.worstRecordByEra[era] = { wins, losses }

  if (!s.highestTeamRating || teamRating > s.highestTeamRating.rating)
    s.highestTeamRating = { rating: teamRating, era }

  for (const p of players) {
    const existing = s.playerDraftCounts[p.personId] ?? { name: p.name, count: 0 }
    existing.count++
    s.playerDraftCounts[p.personId] = existing
  }

  const existingCoach = s.coachDraftCounts[coach] ?? { name: coach, count: 0 }
  existingCoach.count++
  s.coachDraftCounts[coach] = existingCoach

  save(s, mode)
}

export function clearLifetimeStats(mode: 'normal' | 'salary_cap' = 'normal') {
  try { localStorage.removeItem(KEYS[mode]) } catch {}
}
