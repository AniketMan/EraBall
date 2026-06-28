export type Era = '50s' | '60s' | '70s' | '80s' | '90s' | '00s' | '10s' | '20s'

export interface Player {
  person_id: string
  full_name: string
  first_name: string
  last_name: string
  position: string
  height: string
  weight: string
  birthdate: string | null
  country: string
  school: string
  draft_year: string
  draft_round: string
  draft_number: string
  from_year: number
  to_year: number | null
  era: Era
  greatest_75_flag: string
  team_abbreviation: string
  GP: number
  PTS: number
  REB: number
  AST: number
  STL: number | null
  BLK: number | null
  TOV: number | null
  FG_PCT: number | null
  FG3_PCT: number | null
  FT_PCT: number | null
  TS_PCT?: number | null
  FG3M?: number | null
  imputed_stats?: string[]
  flexPositions?: SlotPosition[]  // FLEX tag: these starter slots have no fit penalty
  teams_by_era?: Partial<Record<Era, string>>
  all_teams_by_era?: Partial<Record<Era, string[]>>
  stats_by_era?: Record<string, EraStats>  // keyed by "era:team" e.g. "20s:MIL"
  rings?: number
  defAnchor?: boolean
  offAnchor?: boolean
  anchorTier?: 1 | 2
  timeless?: boolean
  shootingStar?: boolean
  shootingStarTier?: 1 | 2
  glassClean?: boolean
  duoPartners?: string[]
  duoActiveCount?: number
  eraTeam?: string  // set by withEraStats to reflect which team's era stats are loaded
}

export interface Coach {
  name: string
  from: number
  to: number
  years: number
  regG: number
  regW: number
  regL: number
  regWLPct: number
  playoffG: number
  playoffW: number
  playoffL: number
  playoffWLPct: number
  conf: number
  champ: number
  offGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  defGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  offGuru?: boolean
  defGuru?: boolean
}

export type SlotPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'B1' | 'B2' | 'B3' | 'B4'

export interface CourtSlot {
  position: SlotPosition
  player: Player | null
  fitPenalty: 0 | 0.10 | 0.25
  fitLabel: 'Position Fit' | 'Positional Penalty -10%' | 'Major Penalty -25%' | null
}

export type GamePhase = 'era-select' | 'draft' | 'coach-draft' | 'simulation' | 'results'

export interface GameResult {
  win: boolean
  teamScore: number
  oppScore: number
}

export interface EraStats {
  team: string
  GP: number
  PTS: number
  REB: number
  AST: number
  STL: number | null
  BLK: number | null
  TOV: number | null
  FG_PCT: number | null
  FG3_PCT: number | null
  FT_PCT: number | null
  TS_PCT?: number | null
  FG3M?: number | null
}

export interface PlayerRating {
  player: Player
  slot: SlotPosition
  base: number
  adjusted: number
  fitPenalty: number
  eraMod: number
  fitLabel: CourtSlot['fitLabel']
}

export interface PlayerSeasonStats {
  player: Player
  slot: SlotPosition
  GP: number
  MPG: number
  PTS: number
  REB: number
  AST: number
  STL: number
  BLK: number
  TOV: number
  FG_PCT: number
  FG3_PCT: number | null
  FT_PCT: number
}

export interface PlayoffRound {
  name: string
  seriesWins: number
  seriesLosses: number
  advanced: boolean
  winsNeeded: number
}

export interface GameLeader { name: string; val: number }

export interface SpecialPerformance {
  playerName: string
  pts: number; reb: number; ast: number
  label: string
}

export interface PlayoffGame {
  win: boolean
  roundIndex: number
  teamScore: number
  oppScore: number
  gameInSeries: number
  leaders: { pts: GameLeader; reb: GameLeader; ast: GameLeader }
  special?: SpecialPerformance
  playerLines?: { personId: string; name: string; slot: string; mpg: number; pts: number; reb: number; ast: number; stl: number; blk: number; tov: number; fg: number; fg3: number | null; ft: number }[]
}

export interface PlayoffResult {
  rounds: PlayoffRound[]
  champion: boolean
  allGames: PlayoffGame[]
  playoffStats: PlayerSeasonStats[]
  finalsStats: PlayerSeasonStats[]
}

// Team-level diagnostic factors produced by a season simulation. These mirror the
// inline return shape of simulateSeason() and are surfaced so consumers can display
// roster construction analysis (spacing, rebounding, assist, and block factors).
export interface TeamAnalysis {
  spacingWinFactor: number
  shooterCount: number
  spacingBaseline: number
  isPreThreePt: boolean
  highVolumeShooterCount: number
  rebFactor: number
  blkScore: number
  astFactor: number
}

// Full result of a regular-season simulation. Mirrors the simulateSeason() return type
// exactly so the facade can expose a single named contract instead of an inline literal.
export interface SeasonResult {
  wins: number
  losses: number
  games: boolean[]
  seasonStats: PlayerSeasonStats[]
  avgTeamScore: number
  avgOppScore: number
  teamAnalysis: TeamAnalysis
}
