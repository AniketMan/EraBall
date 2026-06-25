import type { LifetimeStats } from './lifetimeStats'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  title: string
  description: string
  rarity: AchievementRarity
}

export interface RunContext {
  era: string
  mode: 'normal' | 'salary_cap'
  wins: number
  losses: number
  champion: boolean
  teamRating: number
  coachGrade: string
  hasSTierStarter: boolean
}

type CheckFn = (normal: LifetimeStats, cap: LifetimeStats, run: RunContext) => boolean

const DEFS: (Achievement & { check: CheckFn })[] = [
  {
    id: 'first_ring',
    title: 'First Ring',
    description: 'Win your first championship.',
    rarity: 'common',
    check: (n, c) => n.championshipsTotal >= 1 || c.championshipsTotal >= 1,
  },
  {
    id: 'dynasty',
    title: 'Dynasty',
    description: 'Win 5 championships.',
    rarity: 'rare',
    check: (n, c) => (n.championshipsTotal + c.championshipsTotal) >= 5,
  },
  {
    id: 'legend',
    title: 'Legend',
    description: 'Win 20 championships.',
    rarity: 'epic',
    check: (n, c) => (n.championshipsTotal + c.championshipsTotal) >= 20,
  },
  {
    id: 'goat',
    title: 'GOAT',
    description: 'Win 50 championships.',
    rarity: 'legendary',
    check: (n, c) => (n.championshipsTotal + c.championshipsTotal) >= 50,
  },
  {
    id: 'historian',
    title: 'Historian',
    description: 'Complete 30 drafts.',
    rarity: 'common',
    check: (n, c) => (n.draftsCompleted + c.draftsCompleted) >= 30,
  },
  {
    id: 'veteran',
    title: 'EraBall Veteran',
    description: 'Complete 100 drafts.',
    rarity: 'rare',
    check: (n, c) => (n.draftsCompleted + c.draftsCompleted) >= 100,
  },
  {
    id: 'old_school',
    title: 'Old, Old School',
    description: 'Win a championship in the 50s era.',
    rarity: 'rare',
    check: (n, c) => ((n.championshipsByEra?.['50s'] ?? 0) + (c.championshipsByEra?.['50s'] ?? 0)) >= 1,
  },
  {
    id: 'all_era',
    title: 'All-Time Ruler',
    description: 'Win a championship in every era.',
    rarity: 'legendary',
    check: (n, c) => ['50s','60s','70s','80s','90s','00s','10s','20s'].every(
      e => ((n.championshipsByEra?.[e] ?? 0) + (c.championshipsByEra?.[e] ?? 0)) >= 1
    ),
  },
  {
    id: 'dominant',
    title: 'Warriors who?',
    description: 'Finish a regular season with 74 or more wins.',
    rarity: 'rare',
    check: (n, c) => (n.bestRecord?.wins ?? 0) >= 75 || (c.bestRecord?.wins ?? 0) >= 74,
  },
  {
    id: 'perfect_season',
    title: 'Perfect Season',
    description: 'Win 81 or more regular season games.',
    rarity: 'legendary',
    check: (n, c) => (n.bestRecord?.wins ?? 0) >= 81 || (c.bestRecord?.wins ?? 0) >= 81,
  },
  {
    id: 'no_stars',
    title: 'No Stars Needed',
    description: 'Win a 20s era championship without an S-tier starter.',
    rarity: 'epic',
    check: (_n, _c, run) => run.champion && run.era === '20s' && !run.hasSTierStarter,
  },
  {
    id: 'cap_champion',
    title: 'Cap Champion',
    description: 'Win a championship in Salary Cap Draft mode.',
    rarity: 'rare',
    check: (_n, c) => c.championshipsTotal >= 1,
  },
  {
    id: 'loyal',
    title: 'Loyal',
    description: 'Draft the same player 10 times.',
    rarity: 'common',
    check: (n, c) =>
      Object.values(n.playerDraftCounts).some(p => p.count >= 10) ||
      Object.values(c.playerDraftCounts).some(p => p.count >= 10),
  },
  {
    id: 'rebuilder',
    title: 'Rebuilder',
    description: 'Win a championship with a team rating under 60.',
    rarity: 'epic',
    check: (_n, _c, run) => run.champion && run.teamRating < 60,
  },
]

const ACHIEVEMENTS_KEY = 'eraball_achievements'

function getUnlocked(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) ?? '[]')) } catch { return new Set() }
}

function saveUnlocked(set: Set<string>) {
  try { localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...set])) } catch {}
}

export function checkAchievements(
  normalStats: LifetimeStats,
  capStats: LifetimeStats,
  run: RunContext,
): Achievement[] {
  const unlocked = getUnlocked()
  const newlyUnlocked: Achievement[] = []
  for (const def of DEFS) {
    if (!unlocked.has(def.id) && def.check(normalStats, capStats, run)) {
      unlocked.add(def.id)
      newlyUnlocked.push({ id: def.id, title: def.title, description: def.description, rarity: def.rarity })
    }
  }
  if (newlyUnlocked.length > 0) saveUnlocked(unlocked)
  return newlyUnlocked
}

export function getAllAchievements(): { achievement: Achievement; unlocked: boolean }[] {
  const unlocked = getUnlocked()
  return DEFS.map(({ id, title, description, rarity }) => ({
    achievement: { id, title, description, rarity },
    unlocked: unlocked.has(id),
  }))
}

export function clearAchievements() {
  try { localStorage.removeItem(ACHIEVEMENTS_KEY) } catch {}
}
