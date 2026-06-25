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

export type ScoreFlags = { no_timeless?: boolean; no_s_tier?: boolean }

export function calcLeaderboardScore(
  entry: Omit<LeaderboardEntry, 'id' | 'score' | 'created_at'>,
  flags?: ScoreFlags,
): number {
  const playoffBonus: Record<string, number> = {
    champion: 500,
    finals: 300,
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
    if (flags?.no_s_tier) challengeBonus += 150
    if (coachNum <= 2) challengeBonus += 100  // C grade or below
  }

  return (
    entry.reg_win_pct * 500 +
    entry.playoff_win_pct * 400 +
    entry.avg_pt_diff * 8 +
    entry.team_rating * 3 +
    coachNum * 20 +
    bonus +
    challengeBonus
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

export async function fetchLeaderboard(era: string, mode: 'normal' | 'salary_cap', limit = 50) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('era', era)
    .eq('mode', mode)
    .order('score', { ascending: false })
    .limit(limit)
  if (error) console.error('Leaderboard fetch error:', error.message, error.code, error.details, error.hint)
  return data ?? []
}
