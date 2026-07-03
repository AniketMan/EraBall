import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prwdkaffzphfqlhlaiab.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd2RrYWZmenBoZnFsaGxhaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjA4MzYsImV4cCI6MjA5Nzg5NjgzNn0.K5tN3I2kGQFS_XZovCYN8qfd7aD-cROMMQQaI-CsmwU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type RosterSlot = { slot: string; name: string; era: string }
export type LeaderboardRoster = { starters: RosterSlot[]; bench: { name: string; era: string }[] }

export type LeaderboardEntry = {
  id?: string
  era: string
  mode: 'normal' | 'salary_cap'
  team_name: string | null
  roster?: LeaderboardRoster | null
  reg_wins: number
  reg_losses: number
  reg_win_pct: number
  playoff_wins: number
  playoff_losses: number
  playoff_win_pct: number
  playoff_result: string | null
  avg_pt_diff: number
  team_rating: number
  coach_name: string | null
  coach_grade: string | null
  score: number
  created_at?: string
}

const GRADE_RANK: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 }

export type ScoreFlags = {
  no_timeless?: boolean
  no_s_tier?: boolean
  elite_spacing?: boolean
  elite_rim?: boolean
  elite_playmaking?: boolean
  reb_edge?: boolean
  duo_pair?: boolean
  duo_trio?: boolean
  bad_coach?: boolean
  sixth_man_bench?: boolean
}

export function calcLeaderboardScore(
  entry: Omit<LeaderboardEntry, 'id' | 'score' | 'created_at'>,
  flags?: ScoreFlags,
): number {
  const playoffBonus: Record<string, number> = {
    champion: 500,
    finals: 350,
    conf_finals: 175,
    second_round: 75,
    first_round: 25,
  }
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
  if (flags?.elite_spacing)   teamBonus += 40
  if (flags?.elite_rim)       teamBonus += 50
  if (flags?.elite_playmaking) teamBonus += 40
  if (flags?.reb_edge)        teamBonus += 25
  if (flags?.duo_pair)        teamBonus += 30
  if (flags?.duo_trio)        teamBonus += 65
  if (flags?.sixth_man_bench) teamBonus += 15

  return (
    entry.reg_win_pct * 500 +
    entry.playoff_win_pct * 400 +
    entry.avg_pt_diff * 8 +
    entry.team_rating * 3 +
    coachNum * 20 +
    bonus +
    challengeBonus +
    teamBonus
  )
}

export async function submitLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'score' | 'created_at' | 'roster'> & { roster?: LeaderboardRoster | null },
  flags?: ScoreFlags,
) {
  const score = calcLeaderboardScore(entry, flags)
  const { error } = await supabase.from('leaderboard').insert({ ...entry, score })
  if (error) console.error('Leaderboard submit error:', error)
  return score
}

export async function fetchScoreRank(era: string, mode: 'normal' | 'salary_cap', score: number): Promise<number> {
  const { count, error } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .eq('era', era)
    .eq('mode', mode)
    .is('Week', null)
    .gt('score', score)
  if (error) console.error('Rank fetch error:', error)
  return (count ?? 0) + 1
}

export async function fetchLeaderboard(era: string, mode: 'normal' | 'salary_cap', limit = 50, week?: string | null) {
  let query = supabase
    .from('leaderboard')
    .select('*')
    .eq('era', era)
    .eq('mode', mode)
    .order('score', { ascending: false })
    .limit(limit)
  query = week ? query.eq('Week', week) : query.is('Week', null)
  const { data, error } = await query
  if (error) console.error('Leaderboard fetch error:', error.message, error.code, error.details, error.hint)
  return data ?? []
}

export async function fetchPastWeeks(): Promise<string[]> {
  const { data } = await supabase.from('leaderboard').select('Week').not('Week', 'is', null).limit(500)
  if (!data) return []
  const seen = new Set<string>()
  for (const row of data) if (row.Week) seen.add(row.Week as string)
  return [...seen].sort((a, b) => (parseInt(b.replace('week-', '')) || 0) - (parseInt(a.replace('week-', '')) || 0))
}
