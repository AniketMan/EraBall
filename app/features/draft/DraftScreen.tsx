'use client'
// app/features/draft/DraftScreen.tsx
// Feature screen: the player draft board (roster building, tag filters, salary cap, court fit).
// Owns its draft-specific tag taxonomy (TagKey, TAG_OPTIONS).

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { Player, Era, CourtSlot, SlotPosition, PlayerTier } from '@eraball/engine'
import {
  ALL_ERAS, SLOT_POSITIONS, SLOT_MPG, calcFitPenalty, calcEraModifier, calcTS,
  playerBaseRating, playerMatchesEra, withEraStats, playerTier, CAP_QUOTAS,
  applyFlexTag, applyRings, applyFinalsMVP, applyAnchors, applyTimeless, applyShootingStar, applyGlassCleaner, applyDuo,
  SIXTH_MAN_PLAYERS,
} from '@eraball/engine'
import { G, BEBAS } from '../../../src/components/tokens'
import { Btn, GoldLabel, PlayerHeadshot } from '../../../src/components'
import { shuffle, eraLabel, NBA_TEAMS, playerTeamForEra, emptySlots } from '../../../src/lib/ui'
import { PlayerCard, CourtSlotView, TopBar } from '../../_shared'

// ─── Phase 2: Draft ───────────────────────────────────────────────────────────
type TagKey = 'timeless' | 'offAnchor' | 'defAnchor' | 'shootingStar' | 'glassClean' | 'flex' | 'champion' | 'dynamicDuo'
const TAG_OPTIONS: { key: TagKey; label: string; color: string }[] = [
  { key: 'timeless',     label: 'Timeless',         color: '#C084FC' },
  { key: 'offAnchor',    label: 'Offensive Anchor',  color: G.gold },
  { key: 'defAnchor',    label: 'Defensive Anchor',  color: '#4A9ECC' },
  { key: 'shootingStar', label: 'Shooting Star',     color: '#F472B6' },
  { key: 'glassClean',   label: 'Glass Cleaner',     color: '#34D399' },
  { key: 'flex',         label: 'Flex',              color: '#4A9ECC' },
  { key: 'champion',     label: 'Champion',          color: G.gold },
  { key: 'dynamicDuo',   label: 'Dynamic Duo',       color: '#4ECDC4' },
]

export function DraftScreen({ simEra, players, onDraftComplete, onRestart, startInSandbox, salaryCapMode, greyscaleBtn, muteBtn, themeFilter }: {
  simEra: Era; players: Player[]; onDraftComplete: (slots: CourtSlot[], customEras: Era[] | null, wasSandbox: boolean) => void; onRestart: () => void; startInSandbox?: boolean; salaryCapMode?: boolean; greyscaleBtn?: React.ReactNode; muteBtn?: React.ReactNode; themeFilter?: string
}) {
  const fifties = themeFilter === 'grayscale(1)'
  const [slots, setSlots] = useState<CourtSlot[]>(emptySlots())
  const [spinning, setSpinning] = useState(false)
  const [rosterPool, setRosterPool] = useState<Player[]>([])
  const [sortBy, setSortBy] = useState<'SPECIAL' | 'PTS' | 'REB' | 'AST' | 'FG3' | 'STL' | 'BLK' | 'BASE'>('PTS')
  const [posFilter, setPosFilter] = useState<'G' | 'F' | 'C' | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [rosterCardPlayer, setRosterCardPlayer] = useState<Player | null>(null)
  const [pendingSlotIdx, setPendingSlotIdx] = useState<number | null>(null)
  const [highlightEmpty, setHighlightEmpty] = useState(false)
  const [spinTeamDisplay, setSpinTeamDisplay] = useState('')
  const [spinEraDisplay, setSpinEraDisplay] = useState<Era>('90s')
  const [spinKey, setSpinKey] = useState(0)
  const [spinPhase, setSpinPhase] = useState<'fast' | 'slow' | 'land'>('fast')
  const [lockedTeam, setLockedTeam] = useState('')
  const [lockedEra, setLockedEra] = useState<Era | null>(null)
  const [draftedIds, setDraftedIds] = useState<Set<string>>(new Set())
  const [awaitingSpin, setAwaitingSpin] = useState(false)
  const [noPlayersMsg, setNoPlayersMsg] = useState(false)
  const [capViolationMsg, setCapViolationMsg] = useState('')
  const [spinsThisRound, setSpinsThisRound] = useState(0)
  const [respinUsed, setRespinUsed] = useState(false)
  const [eraFilter, setEraFilter] = useState<Set<Era>>(new Set(ALL_ERAS))
  const [showEraFilter, setShowEraFilter] = useState(false)
  const [eraFilterLocked, setEraFilterLocked] = useState(false)
  const isCustomRange = eraFilter.size < ALL_ERAS.length
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const [devMode, setDevMode] = useState(false)
  const [devTeam, setDevTeam] = useState(NBA_TEAMS[0])
  const [devEra, setDevEra] = useState<Era>(ALL_ERAS[6]) // default 10s
  const [devPlayerSearch, setDevPlayerSearch] = useState('')
  const [sandboxMode, setSandboxMode] = useState(startInSandbox ?? false)
  const [sandboxTeam, setSandboxTeam] = useState(NBA_TEAMS[0])
  const [sandboxEra, setSandboxEra] = useState<Era>(ALL_ERAS[6])
  const [sandboxTeamSearch, setSandboxTeamSearch] = useState('')
  const [sandboxTeamOpen, setSandboxTeamOpen] = useState(false)
  const [sandboxTab, setSandboxTab] = useState<'spin' | 'team' | 'player' | 'tag'>('team')
  const [sandboxPlayerSearch, setSandboxPlayerSearch] = useState('')
  const [draggedSlotIdx, setDraggedSlotIdx] = useState<number | null>(null)

  const filledCount = slots.filter(s => s.player !== null).length
  const visiblePoolRef = useRef<Player[]>([])

  // All team abbreviations for the animation flythrough display
  const allTeams = useMemo(() => {
    const teams = new Set<string>()
    for (const p of players) {
      for (const teamList of Object.values(p.all_teams_by_era ?? {})) {
        for (const t of (teamList as string[])) { if (t) teams.add(t) }
      }
      // fallback for old data without all_teams_by_era
      for (const t of Object.values(p.teams_by_era ?? {})) { if (t) teams.add(t) }
      if (p.team_abbreviation) teams.add(p.team_abbreviation)
    }
    return Array.from(teams).sort()
  }, [players])

  // Only spin from combos that actually have players — eliminates empty-combo failures.
  // Falls back to teams_by_era when all_teams_by_era is absent (pre-pipeline-rerun data).
  const validCombos = useMemo(() => {
    const seen = new Set<string>()
    const combos: { team: string; era: Era }[] = []
    for (const p of players) {
      const allTeamsByEra = p.all_teams_by_era
      if (allTeamsByEra && Object.keys(allTeamsByEra).length > 0) {
        for (const [era, teamList] of Object.entries(allTeamsByEra)) {
          for (const team of (teamList as string[])) {
            if (!team) continue
            const key = `${team}:${era}`
            if (!seen.has(key)) { seen.add(key); combos.push({ team, era: era as Era }) }
          }
        }
      } else {
        for (const [era, team] of Object.entries(p.teams_by_era ?? {})) {
          if (!team) continue
          const key = `${team}:${era}`
          if (!seen.has(key)) { seen.add(key); combos.push({ team, era: era as Era }) }
        }
      }
    }
    return combos
  }, [players])

  const sandboxValidEras = useMemo(
    () => sandboxTeam === 'ALL'
      ? new Set(ALL_ERAS)
      : new Set(validCombos.filter(c => c.team === sandboxTeam).map(c => c.era)),
    [validCombos, sandboxTeam]
  )

  const tierCounts = useMemo(() => {
    const counts: Record<PlayerTier, number> = { s: 0, a: 0, b: 0, c: 0, d: 0 }
    for (const s of slots) {
      if (s.player) counts[playerTier(playerBaseRating(s.player, simEra))]++
    }
    return counts
  }, [slots, simEra])

  const neededTiers = useMemo<PlayerTier[]>(() =>
    salaryCapMode
      ? (Object.entries(CAP_QUOTAS) as [PlayerTier, number][]).filter(([t, q]) => tierCounts[t] < q).map(([t]) => t)
      : [],
    [salaryCapMode, tierCounts]
  )

  const spin = useCallback(() => {
    if (rosterPool.length > 0) { setSpinsThisRound(prev => prev + 1); setRespinUsed(true) }
    setEraFilterLocked(true)
    setSpinning(true)
    setAwaitingSpin(false)
    setNoPlayersMsg(false)
    setRosterPool([])
    setSelectedPlayer(null)
    setPendingSlotIdx(null)
    setHighlightEmpty(false)
    // Slot machine: fast → slow → land
    const schedule = [
      ...Array(10).fill(65),   // fast
      ...Array(5).fill(120),   // slowing
      ...Array(3).fill(220),   // crawling
    ]
    // Capture filter state now — setEraFilterLocked(true) above is async and won't
    // update the closure in time for doTick, so derive it directly from eraFilter.
    const spinShouldFilter = eraFilterLocked || eraFilter.size < ALL_ERAS.length
    const spinEraFilter = eraFilter
    let ticks = 0
    const doTick = () => {
      const phase = ticks < 10 ? 'fast' : ticks < 15 ? 'slow' : 'slow'
      setSpinPhase(phase)
      setSpinTeamDisplay(allTeams[Math.floor(Math.random() * allTeams.length)])
      const filteredEras = spinShouldFilter ? ALL_ERAS.filter(e => spinEraFilter.has(e)) : ALL_ERAS
      setSpinEraDisplay(filteredEras[Math.floor(Math.random() * filteredEras.length)])
      setSpinKey(k => k + 1)
      if (ticks < schedule.length) {
        setTimeout(doTick, schedule[ticks++])
      } else {
        // Land
        const filteredCombos = spinShouldFilter ? validCombos.filter(c => spinEraFilter.has(c.era)) : validCombos
        if (filteredCombos.length === 0) { setSpinning(false); return }
        const TIER_PRIORITY: PlayerTier[] = ['s', 'a', 'b', 'c', 'd']
        // Pick any random combo just for the landing display animation
        const { team: initialTeam, era: initialEra } = filteredCombos[Math.floor(Math.random() * filteredCombos.length)]
        setSpinPhase('land')
        setSpinTeamDisplay(initialTeam); setSpinEraDisplay(initialEra)
        setSpinKey(k => k + 1)
        setDraftedIds(ids => {
          // All guarantee logic runs here with truly-current ids.
          // freshShuffled covers ALL filteredCombos — no pre-filtering by stale closure draftedIds.
          let team = initialTeam, era = initialEra
          if (salaryCapMode && neededTiers.length > 0) {
            const highestNeeded = TIER_PRIORITY.find(t => (neededTiers as string[]).includes(t))
            const freshShuffled = shuffle([...filteredCombos])
            const getPool = (t: string, e: Era) => players.filter(p => {
              const eraTeams = p.all_teams_by_era?.[e] as string[] | undefined
              const onTeam = eraTeams ? eraTeams.includes(t) : playerTeamForEra(p, e) === t
              return onTeam && playerMatchesEra(p, e) && !ids.has(p.person_id)
            })
            let found = false
            // Pass 1: find a combo with the highest needed tier and 3+ available players
            for (const combo of freshShuffled) {
              const pool = getPool(combo.team, combo.era)
              if (pool.length >= 3 && pool.some(p => playerTier(playerBaseRating(applyAnchors(withEraStats(p, combo.era, combo.team)), simEra)) === highestNeeded)) {
                team = combo.team; era = combo.era; found = true; break
              }
            }
            // Pass 2: fall back to any needed tier
            if (!found) {
              for (const combo of freshShuffled) {
                const pool = getPool(combo.team, combo.era)
                if (pool.length >= 3 && pool.some(p => (neededTiers as string[]).includes(playerTier(playerBaseRating(applyAnchors(withEraStats(p, combo.era, combo.team)), simEra))))) {
                  team = combo.team; era = combo.era; break
                }
              }
            }
            setSpinTeamDisplay(team); setSpinEraDisplay(era)
          }
          const pool = players.filter(p => {
            const allTeams = p.all_teams_by_era?.[era] as string[] | undefined
            const onTeam = allTeams ? allTeams.includes(team) : playerTeamForEra(p, era) === team
            return onTeam && playerMatchesEra(p, era) && !ids.has(p.person_id)
          })
          if (pool.length < 3) {
            setSpinning(false)
            setNoPlayersMsg(true)
            return ids
          }
          setLockedTeam(team); setLockedEra(era)
          setRosterPool([...pool].map(p => applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(p, era, team)))))))))).sort((a, b) => (b.PTS ?? 0) - (a.PTS ?? 0)))
          setSpinning(false)
          return ids
        })
      }
    }
    setTimeout(doTick, schedule[ticks++])
  }, [players, allTeams, validCombos, rosterPool, respinUsed, eraFilter, eraFilterLocked, draftedIds, salaryCapMode, neededTiers, simEra])

  const removeSlotPlayer = (idx: number) => {
    const p = slots[idx].player
    if (!p) return
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, player: null, fitPenalty: 0, fitLabel: null } : s))
    setDraftedIds(prev => { const next = new Set(prev); next.delete(p.person_id); return next })
    setSelectedPlayer(null); setPendingSlotIdx(null)
  }

  const swapSlotPlayers = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return
    setSlots(prev => {
      const next = [...prev]
      const fromPlayer = next[fromIdx].player
      const toPlayer = next[toIdx].player
      const { penalty: fp, label: fl } = fromPlayer ? calcFitPenalty(fromPlayer, next[toIdx].position) : { penalty: 0 as const, label: null }
      const { penalty: tp, label: tl } = toPlayer ? calcFitPenalty(toPlayer, next[fromIdx].position) : { penalty: 0 as const, label: null }
      next[toIdx] = { ...next[toIdx], player: fromPlayer, fitPenalty: fp, fitLabel: fl }
      next[fromIdx] = { ...next[fromIdx], player: toPlayer, fitPenalty: tp, fitLabel: tl }
      return next
    })
  }

  const previewSlot = (idx: number) => {
    if (slots[idx].player !== null) { setRosterCardPlayer(slots[idx].player); return }
    if (!selectedPlayer) return
    if (pendingSlotIdx === idx) { confirmPick(); return }
    setPendingSlotIdx(idx)
  }

  const confirmPick = () => {
    if (pendingSlotIdx === null || !selectedPlayer) return
    if (salaryCapMode) {
      const tier = playerTier(playerBaseRating(selectedPlayer, simEra))
      if (tierCounts[tier] >= CAP_QUOTAS[tier]) {
        setCapViolationMsg(`${tier.toUpperCase()} tier is full (${CAP_QUOTAS[tier]}/${CAP_QUOTAS[tier]}). Pick a different player.`)
        setTimeout(() => setCapViolationMsg(''), 3000)
        setPendingSlotIdx(null)
        return
      }
    }
    // selectedPlayer already has era stats applied from when the pool was built
    const { penalty, label } = calcFitPenalty(selectedPlayer, slots[pendingSlotIdx].position)
    setSlots(prev => prev.map((s, i) => i === pendingSlotIdx ? { ...s, player: selectedPlayer, fitPenalty: penalty, fitLabel: label } : s))
    setDraftedIds(prev => new Set([...prev, selectedPlayer.person_id]))
    setRosterPool([])
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setSpinsThisRound(0)
    setAwaitingSpin(true)
    if (window.innerWidth < 640) requestAnimationFrame(() => {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && pendingSlotIdx !== null && selectedPlayer) { confirmPick(); return }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const pool = visiblePoolRef.current
        if (pool.length === 0) return
        e.preventDefault()
        const cur = selectedPlayer ? pool.findIndex(p => p.person_id === selectedPlayer.person_id) : -1
        const next = e.key === 'ArrowDown' ? Math.min(cur + 1, pool.length - 1) : Math.max(cur - 1, 0)
        const p = pool[next]
        if (p) {
          setSelectedPlayer(p); setHighlightEmpty(true); setPendingSlotIdx(null)
          requestAnimationFrame(() => document.getElementById(`player-row-${p.person_id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pendingSlotIdx, selectedPlayer])

  // Prefetch headshots for the first 20 roster players as soon as the pool loads
  useEffect(() => {
    if (rosterPool.length === 0) return
    rosterPool.slice(0, 20).forEach(p => {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.src = `https://cdn.nba.com/headshots/nba/latest/260x190/${p.person_id}.png`
    })
  }, [rosterPool])

  const loadDevRoster = () => {
    setDraftedIds(ids => {
      const isAll = devTeam === 'ALL'
      const pool = players.filter(p => {
        if (!playerMatchesEra(p, devEra) || ids.has(p.person_id)) return false
        if (isAll) return true
        const eraTeams = p.all_teams_by_era?.[devEra] as string[] | undefined
        return eraTeams ? eraTeams.includes(devTeam) : playerTeamForEra(p, devEra) === devTeam
      })
      if (pool.length === 0) { alert(`No players found for ${devEra}`); return ids }
      const sorted = [...pool].map(p => {
        const team = isAll
          ? ((p.all_teams_by_era?.[devEra] as string[] | undefined)?.[0] ?? p.team_abbreviation)
          : devTeam
        return applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(p, devEra, team)))))))))
      }).sort((a, b) => (b.PTS ?? 0) - (a.PTS ?? 0))
      setLockedTeam(devTeam); setLockedEra(devEra)
      setSpinTeamDisplay(isAll ? devEra : devTeam); setSpinEraDisplay(devEra)
      setRosterPool(sorted)
      setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false); setAwaitingSpin(false)
      return ids
    })
  }

  const loadSandboxRoster = () => {
    setDraftedIds(ids => {
      const pool = players.filter(p => {
        if (!playerMatchesEra(p, sandboxEra) || ids.has(p.person_id)) return false
        if (sandboxTeam === 'ALL') return true
        const eraTeams = p.all_teams_by_era?.[sandboxEra] as string[] | undefined
        return eraTeams ? eraTeams.includes(sandboxTeam) : playerTeamForEra(p, sandboxEra) === sandboxTeam
      })
      if (pool.length === 0) { alert(`No players found for ${sandboxTeam} - ${sandboxEra}`); return ids }
      const sorted = pool.map(p => {
        const team = sandboxTeam === 'ALL' ? (playerTeamForEra(p, sandboxEra) ?? p.team_abbreviation) : sandboxTeam
        return applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(p, sandboxEra, team)))))))))
      }).sort((a, b) => (b.PTS ?? 0) - (a.PTS ?? 0))
      setLockedTeam(sandboxTeam); setLockedEra(sandboxEra)
      setSpinTeamDisplay(sandboxTeam); setSpinEraDisplay(sandboxEra)
      setRosterPool(sorted)
      setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false); setAwaitingSpin(false)
      return ids
    })
  }

  const loadPlayerVersions = () => {
    const query = sandboxPlayerSearch.trim().toLowerCase()
    if (!query) return
    const match = players.find(p => p.full_name.toLowerCase().includes(query))
    if (!match) { alert(`No player found matching "${sandboxPlayerSearch}"`); return }
    const versions: Player[] = []
    const seen = new Set<string>()
    for (const key of Object.keys(match.stats_by_era ?? {})) {
      const [era, team] = key.split(':') as [Era, string]
      if (!era || !team || seen.has(key)) continue
      seen.add(key)
      versions.push(applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(match, era, team))))))))))
    }
    if (versions.length === 0) { alert(`No era stats found for ${match.full_name}`); return }
    versions.sort((a, b) => ALL_ERAS.indexOf(a.era as Era) - ALL_ERAS.indexOf(b.era as Era))
    setDraftedIds(ids => {
      const available = versions.filter(p => !ids.has(p.person_id))
      if (available.length === 0) { alert(`${match.full_name} is already on your roster.`); return ids }
      setLockedTeam(match.full_name); setLockedEra(null)
      setSpinTeamDisplay(match.full_name); setSpinEraDisplay(available[0].era as Era)
      setRosterPool(available)
      setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false); setAwaitingSpin(false)
      return ids
    })
  }

  const loadTagPool = (tag: TagKey) => {
    const hasTag = (p: Player) => {
      switch (tag) {
        case 'timeless':     return !!p.timeless
        case 'offAnchor':    return !!p.offAnchor
        case 'defAnchor':    return !!p.defAnchor
        case 'shootingStar': return !!p.shootingStar
        case 'glassClean':   return !!p.glassClean
        case 'flex':         return !!p.flexPositions
        case 'champion':     return (p.rings ?? 0) > 0
        case 'dynamicDuo':   return !!p.duoPartners
        default:             return false
      }
    }
    const tagged: Player[] = []
    for (const p of players) {
      const seen = new Set<string>()
      for (const key of Object.keys(p.stats_by_era ?? {})) {
        const [era, team] = key.split(':') as [Era, string]
        if (!era || !team || seen.has(key)) continue
        seen.add(key)
        const v = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(p, era, team)))))))))
        if (hasTag(v)) tagged.push(v)
      }
    }
    tagged.sort((a, b) => playerBaseRating(b, b.era as Era) - playerBaseRating(a, a.era as Era))
    if (tagged.length === 0) { alert(`No players found with the ${TAG_OPTIONS.find(t => t.key === tag)?.label} tag`); return }
    setDraftedIds(ids => {
      const available = tagged.filter(p => !ids.has(p.person_id))
      if (available.length === 0) { alert('All players with this tag are already on your roster.'); return ids }
      setLockedTeam(TAG_OPTIONS.find(t => t.key === tag)?.label ?? tag); setLockedEra(null)
      setSpinTeamDisplay(TAG_OPTIONS.find(t => t.key === tag)?.label ?? tag); setSpinEraDisplay(available[0].era as Era)
      setRosterPool(available)
      setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false); setAwaitingSpin(false)
      return ids
    })
  }

  const fillBestNine = () => {
    const scored = players.map(p => ({
      p,
      score: (p.PTS ?? 0) * calcEraModifier(p as Player & { era: Era }, simEra),
    }))
    const top9 = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map(({ p }) => applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(p, p.era as Era, p.team_abbreviation))))))))))
    const newSlots = SLOT_POSITIONS.map((pos, i) => {
      const { penalty, label } = calcFitPenalty(top9[i], pos)
      return { position: pos, player: top9[i], fitPenalty: penalty, fitLabel: label }
    })
    setSlots(newSlots)
    setDraftedIds(new Set(top9.map(p => p.person_id)))
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setRosterPool([]); setAwaitingSpin(false)
  }

  const fillRandom = () => {
    const shuffled = shuffle(players)
    const picks = shuffled.slice(0, 9)
    const newSlots = SLOT_POSITIONS.map((pos, i) => {
      const player = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(picks[i], picks[i].era as Era, picks[i].team_abbreviation)))))))))
      const { penalty, label } = calcFitPenalty(player, pos)
      return { position: pos, player, fitPenalty: penalty, fitLabel: label }
    })
    setSlots(newSlots)
    setDraftedIds(new Set(picks.map(p => p.person_id)))
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setRosterPool([]); setAwaitingSpin(false)
  }

  const fillDevPreset = () => {
    const preset: { name: string; era: Era; team: string; slot: SlotPosition }[] = [
      { name: 'Jamal Murray',             era: '20s', team: 'DEN', slot: 'PG' },
      { name: 'Kentavious Caldwell-Pope', era: '20s', team: 'DEN', slot: 'SG' },
      { name: 'Michael Porter Jr.',       era: '20s', team: 'DEN', slot: 'SF' },
      { name: 'Aaron Gordon',             era: '20s', team: 'DEN', slot: 'PF' },
      { name: 'Nikola Jokic',            era: '20s', team: 'DEN', slot: 'C'  },
      { name: 'Bruce Brown',              era: '20s', team: 'DEN', slot: 'B1' },
      { name: 'Christian Braun',          era: '20s', team: 'DEN', slot: 'B2' },
      { name: 'Julian Strawther',         era: '20s', team: 'DEN', slot: 'B3' },
      { name: 'Peyton Watson',            era: '20s', team: 'DEN', slot: 'B4' },
    ]
    const newSlots = emptySlots()
    const drafted = new Set<string>()
    for (const { name, era, team, slot } of preset) {
      // Match by exact name + all_teams_by_era (not the player's primary era field)
      const match = players.find(p => {
        if (p.full_name !== name) return false
        const teamsForEra = (p.all_teams_by_era as Record<string, string[]>)?.[era]
        return teamsForEra?.includes(team)
      })
      if (!match) continue
      const tagged = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(match, era, team)))))))))
      const slotIdx = SLOT_POSITIONS.indexOf(slot)
      const { penalty, label } = calcFitPenalty(tagged, slot)
      newSlots[slotIdx] = { position: slot, player: tagged, fitPenalty: penalty, fitLabel: label }
      drafted.add(match.person_id)
    }
    setSlots(newSlots)
    setDraftedIds(drafted)
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setRosterPool([]); setAwaitingSpin(false)
  }

  const fillShootingTestPreset = () => {
    const preset: { name: string; era: Era; team: string; slot: SlotPosition }[] = [
      { name: 'Stephen Curry',    era: '20s', team: 'GSW', slot: 'PG' },
      { name: 'Kyle Korver',      era: '10s', team: 'ATL', slot: 'SG' },
      { name: 'Andrew Wiggins',   era: '10s', team: 'MIN', slot: 'SF' },
      { name: 'Draymond Green',   era: '10s', team: 'GSW', slot: 'PF' },
      { name: 'Karl-Anthony Towns', era: '20s', team: 'MIN', slot: 'C' },
      { name: 'Damian Lillard',   era: '10s', team: 'POR', slot: 'B1' },
      { name: 'Klay Thompson',    era: '10s', team: 'GSW', slot: 'B2' },
      { name: 'Dejounte Murray',  era: '20s', team: 'SAS', slot: 'B3' },
      { name: "De'Andre Hunter",  era: '20s', team: 'ATL', slot: 'B4' },
    ]
    const newSlots = emptySlots()
    const drafted = new Set<string>()
    for (const { name, era, team, slot } of preset) {
      const match = players.find(p => {
        if (p.full_name !== name) return false
        const teamsForEra = (p.all_teams_by_era as Record<string, string[]>)?.[era]
        return teamsForEra?.includes(team)
      })
      if (!match) continue
      const tagged = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(match, era, team)))))))))
      const slotIdx = SLOT_POSITIONS.indexOf(slot)
      const { penalty, label } = calcFitPenalty(tagged, slot)
      newSlots[slotIdx] = { position: slot, player: tagged, fitPenalty: penalty, fitLabel: label }
      drafted.add(match.person_id)
    }
    setSlots(newSlots)
    setDraftedIds(drafted)
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setRosterPool([]); setAwaitingSpin(false)
  }

  const fillGibbyPreset = () => {
    const preset: { name: string; era: Era; team: string; slot: SlotPosition }[] = [
      { name: 'Damian Lillard',       era: '20s', team: 'MIL', slot: 'PG' },
      { name: 'Gilbert Arenas',       era: '00s', team: 'WAS', slot: 'SG' },
      { name: 'Magic Johnson',        era: '80s', team: 'LAL', slot: 'SF' },
      { name: 'Karl Malone',          era: '90s', team: 'UTA', slot: 'PF' },
      { name: "Shaquille O'Neal",     era: '90s', team: 'LAL', slot: 'C'  },
      { name: 'Jalen Rose',           era: '00s', team: 'IND', slot: 'B1' },
      { name: 'Michael Adams',        era: '90s', team: 'WAS', slot: 'B2' },
      { name: 'Chet Walker',          era: '60s', team: 'CHI', slot: 'B3' },
      { name: 'Adrian Dantley',       era: '70s', team: 'UTH', slot: 'B4' },
    ]
    const newSlots = emptySlots()
    const drafted = new Set<string>()
    for (const { name, era, team, slot } of preset) {
      const match = players.find(p => {
        if (p.full_name !== name) return false
        const teamsForEra = (p.all_teams_by_era as Record<string, string[]>)?.[era]
        return teamsForEra?.includes(team)
      })
      if (!match) continue
      const tagged = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(match, era, team)))))))))
      const slotIdx = SLOT_POSITIONS.indexOf(slot)
      const { penalty, label } = calcFitPenalty(tagged, slot)
      newSlots[slotIdx] = { position: slot, player: tagged, fitPenalty: penalty, fitLabel: label }
      drafted.add(match.person_id)
    }
    setSlots(newSlots)
    setDraftedIds(drafted)
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setRosterPool([]); setAwaitingSpin(false)
  }

  const fillBalancedPreset = () => {
    const preset: { name: string; era: Era; team: string; slot: SlotPosition }[] = [
      { name: 'Damian Lillard',  era: '10s', team: 'POR', slot: 'PG' },
      { name: 'Klay Thompson',   era: '10s', team: 'GSW', slot: 'SG' },
      { name: 'Kawhi Leonard',   era: '10s', team: 'TOR', slot: 'SF' },
      { name: 'Anthony Davis',   era: '10s', team: 'NOP', slot: 'PF' },
      { name: 'Rudy Gobert',     era: '10s', team: 'UTA', slot: 'C'  },
      { name: 'Jimmy Butler',    era: '10s', team: 'MIA', slot: 'B1' },
      { name: 'Jaylen Brown',    era: '10s', team: 'BOS', slot: 'B2' },
      { name: 'Draymond Green',  era: '10s', team: 'GSW', slot: 'B3' },
      { name: 'Bam Adebayo',     era: '10s', team: 'MIA', slot: 'B4' },
    ]
    const newSlots = emptySlots()
    const drafted = new Set<string>()
    for (const { name, era, team, slot } of preset) {
      const match = players.find(p => {
        if (p.full_name !== name) return false
        const teamsForEra = (p.all_teams_by_era as Record<string, string[]>)?.[era]
        return teamsForEra?.includes(team)
      })
      if (!match) continue
      const tagged = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyAnchors(applyFinalsMVP(applyRings(applyFlexTag(withEraStats(match, era, team)))))))))
      const slotIdx = SLOT_POSITIONS.indexOf(slot)
      const { penalty, label } = calcFitPenalty(tagged, slot)
      newSlots[slotIdx] = { position: slot, player: tagged, fitPenalty: penalty, fitLabel: label }
      drafted.add(match.person_id)
    }
    setSlots(newSlots)
    setDraftedIds(drafted)
    setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false)
    setRosterPool([]); setAwaitingSpin(false)
  }

  const slotsWithDuoForRender = slots.map(slot => {
    if (!slot.player) return slot
    const isSixthMan = SIXTH_MAN_PLAYERS.has(slot.player.full_name)
    if (!slot.player.duoPartners && !isSixthMan) return slot
    const duoActiveCount = slot.player.duoPartners
      ? slots.filter(s => s !== slot && s.player && slot.player!.duoPartners!.includes(s.player.full_name)).length
      : (slot.player.duoActiveCount ?? 0)
    const sixthManActive = isSixthMan && slot.position.startsWith('B')
    return { ...slot, player: { ...slot.player, duoActiveCount, sixthManActive } }
  })
  const starterSlots = slotsWithDuoForRender.slice(0, 5)
  const benchSlots = slotsWithDuoForRender.slice(5)

  return (
    <div className="min-h-screen" style={{ background: G.black }}>
      {/* Header bar */}
      <TopBar onRestart={onRestart} right={
        <div className="flex items-center gap-2 sm:gap-4">
          <span style={{ color: G.grey, whiteSpace: 'nowrap' }}>
            <span className="hidden sm:inline">Era: </span><span style={{ color: G.gold }}>{eraLabel(simEra)}</span>
            <span className="mx-1 sm:mx-3" style={{ color: G.border }}>·</span>
            <span className="hidden sm:inline">Picks: </span><span style={{ color: filledCount === 9 ? G.gold : G.white }}>{filledCount}/9</span>
          </span>
          {isLocalhost && <button
            onClick={() => { setDevMode(d => !d); if (sandboxMode) setSandboxMode(false) }}
            className={`text-xs uppercase tracking-widest px-2 py-1 dev-btn${devMode ? ' dev-btn--active' : ''}`}
            style={{
              color: devMode ? G.black : G.greyDark,
              background: devMode ? G.gold : 'transparent',
              border: `1px solid ${devMode ? G.gold : G.border}`,
            }}
            title="Developer mode (pick team/era directly)"
          >DEV</button>}
          {greyscaleBtn}
          {muteBtn}
        </div>
      } />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">

          {/* ── Left: Spin Panel ── */}
          <div className="space-y-4">

            {sandboxMode ? (
              /* ── Sandbox mode ── */
              <div style={{ border: `1px solid ${G.gold}33`, background: G.surface }}>
                <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}`, background: `${G.gold}0a` }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: G.gold }}>Sandbox</span>
                  <div className="flex" style={{ border: `1px solid ${G.border}` }}>
                    {(['Spin', 'Team', 'Player', 'Tag'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setSandboxTab(tab.toLowerCase() as 'spin' | 'team' | 'player' | 'tag')}
                        className="text-xs uppercase tracking-widest px-2 py-1"
                        style={{
                          background: sandboxTab === tab.toLowerCase() ? `${G.gold}22` : 'transparent',
                          color: sandboxTab === tab.toLowerCase() ? G.gold : G.greyDark,
                          border: 'none', cursor: 'pointer',
                        }}
                      >{tab}</button>
                    ))}
                  </div>
                </div>
                {filledCount === 9 && (
                  <div className="p-3">
                    <Btn onClick={() => onDraftComplete(slots, eraFilterLocked && eraFilter.size < ALL_ERAS.length ? [...eraFilter].sort((a, b) => ALL_ERAS.indexOf(a) - ALL_ERAS.indexOf(b)) : null, sandboxMode)} variant="gold" className="w-full py-4 text-base">
                      Draft Coach
                    </Btn>
                  </div>
                )}
                {sandboxTab === 'spin' ? (
                  <>
                    <div className="grid grid-cols-2 gap-px" style={{ background: G.border }}>
                      <div className="py-5 text-center" style={{ background: G.surface }}>
                        <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: G.grey }}>Team</div>
                        <div style={{ ...BEBAS, fontSize: 36, color: spinning ? G.greyDark : G.white, letterSpacing: '0.05em' }}>
                          <span className="slot-reel-window">
                            <span key={`team-${spinKey}`} className={spinning || spinPhase === 'land' ? `slot-reel${spinPhase === 'slow' ? ' slot-reel--slow' : spinPhase === 'land' ? ' slot-reel--land' : ''}` : ''}>
                              {spinTeamDisplay || '—'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="py-5 text-center" style={{ background: G.surface }}>
                        <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: G.grey }}>Era</div>
                        <div style={{ ...BEBAS, fontSize: 36, color: spinning ? G.greyDark : G.gold, letterSpacing: '0.05em' }}>
                          <span className="slot-reel-window">
                            <span key={`era-${spinKey}`} className={spinning || spinPhase === 'land' ? `slot-reel${spinPhase === 'slow' ? ' slot-reel--slow' : spinPhase === 'land' ? ' slot-reel--land' : ''}` : ''}>
                              {spinEraDisplay ? eraLabel(spinEraDisplay) : '—'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {filledCount < 9 && (
                        <Btn onClick={spin} disabled={spinning || (rosterPool.length > 0 && respinUsed)} variant="gold" className={`w-full py-4 text-base${awaitingSpin ? ' spin-awaiting' : ''}`}>
                          {spinning ? 'Spinning...' : 'Spin'}
                        </Btn>
                      )}
                      {awaitingSpin && !spinning && <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.goldDim }}>{filledCount === 9 ? 'Draft your coach' : 'Spin for your next pick'}</div>}
                      {!awaitingSpin && !spinning && !respinUsed && rosterPool.length > 0 && <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.goldDim }}>1 re-spin remaining this draft</div>}
                      {!awaitingSpin && !spinning && respinUsed && rosterPool.length > 0 && <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.grey }}>No re-spins left. Pick from this roster</div>}
                      {noPlayersMsg && !spinning && <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.red }}>All players from this combo drafted. Spin again</div>}
                    </div>
                  </>
                ) : sandboxTab === 'player' ? (
                  <div className="p-3 space-y-3">
                    <div>
                      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Player Name</div>
                      <input
                        type="text"
                        value={sandboxPlayerSearch}
                        onChange={e => setSandboxPlayerSearch(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') loadPlayerVersions() }}
                        placeholder="e.g. LeBron James"
                        className="w-full px-3 py-2 text-sm"
                        style={{ background: G.surface2, border: `1px solid ${G.border}`, color: G.white, outline: 'none', fontSize: 16 }}
                      />
                    </div>
                    <Btn onClick={loadPlayerVersions} variant="outline" className="w-full py-3">
                      Load Player
                    </Btn>
                  </div>
                ) : sandboxTab === 'tag' ? (
                  <div className="p-3 space-y-2">
                    <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Filter by Tag</div>
                    {TAG_OPTIONS.map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => loadTagPool(key)}
                        className="w-full px-3 py-2 text-xs uppercase tracking-widest text-left transition-colors"
                        style={{ background: G.surface2, border: `1px solid ${G.border}`, color, cursor: 'pointer', letterSpacing: '0.12em' }}
                        onMouseEnter={e => (e.currentTarget.style.background = `${color}18`)}
                        onMouseLeave={e => (e.currentTarget.style.background = G.surface2)}
                      >{label}</button>
                    ))}
                    <div className="text-xs" style={{ color: G.greyDark, lineHeight: 1.4 }}>Loads every player with this tag.</div>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    <div className="relative">
                      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Team</div>
                      <input
                        type="text"
                        value={sandboxTeamSearch || (sandboxTeamOpen ? '' : sandboxTeam)}
                        onFocus={() => { setSandboxTeamOpen(true); setSandboxTeamSearch('') }}
                        onBlur={() => setTimeout(() => { setSandboxTeamOpen(false); setSandboxTeamSearch('') }, 150)}
                        onChange={e => { const val = e.target.value.toUpperCase(); setSandboxTeamSearch(val); setSandboxTeamOpen(true) }}
                        placeholder="Search team..."
                        className="w-full px-3 py-2 text-sm font-semibold"
                        style={{ background: G.surface2, border: `1px solid ${G.border}`, color: G.white, outline: 'none', fontSize: 16 }}
                      />
                      {sandboxTeamOpen && (
                        <div className="roster-scroll" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: G.surface2, border: `1px solid ${G.border}`, borderTop: 'none', maxHeight: 200, overflowY: 'auto', zIndex: 50 }}>
                          {(['ALL', ...allTeams]).filter(t => !sandboxTeamSearch || t.startsWith(sandboxTeamSearch)).map(t => (
                            <div
                              key={t}
                              onMouseDown={() => {
                                setSandboxTeam(t); setSandboxTeamSearch(''); setSandboxTeamOpen(false)
                                if (t !== 'ALL') {
                                  const validEras = new Set(validCombos.filter(c => c.team === t).map(c => c.era))
                                  if (!validEras.has(sandboxEra)) { const first = ALL_ERAS.find(era => validEras.has(era)); if (first) setSandboxEra(first) }
                                }
                              }}
                              style={{ padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: t === sandboxTeam ? G.gold : G.white, background: t === sandboxTeam ? `${G.gold}18` : 'transparent', borderBottom: `1px solid ${G.border}` }}
                              onMouseEnter={e => (e.currentTarget.style.background = `${G.gold}22`)}
                              onMouseLeave={e => (e.currentTarget.style.background = t === sandboxTeam ? `${G.gold}18` : 'transparent')}
                            >{t}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Era</div>
                      <select value={sandboxEra} onChange={e => setSandboxEra(e.target.value as Era)} className="w-full px-3 py-2 text-sm font-semibold" style={{ background: G.surface2, border: `1px solid ${G.border}`, color: G.gold, outline: 'none', fontSize: 16 }}>
                        {ALL_ERAS.map(era => (
                          <option key={era} value={era} disabled={!sandboxValidEras.has(era)} style={{ color: sandboxValidEras.has(era) ? undefined : G.greyDark }}>{era}</option>
                        ))}
                      </select>
                    </div>
                    <Btn onClick={loadSandboxRoster} variant="outline" className="w-full py-3">
                      Load Roster
                    </Btn>
                  </div>
                )}
              </div>
            ) : devMode ? (
              /* ── Dev mode: manual team/era picker ── */
              <div style={{ border: `1px solid ${G.gold}33`, background: G.surface }}>
                <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${G.border}`, background: `${G.gold}0a` }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: G.gold }}>Dev Mode</span>
                  <span className="text-xs" style={{ color: G.greyDark }}>pick any team / era directly</span>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Team</div>
                    <select
                      value={devTeam}
                      onChange={e => setDevTeam(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-semibold"
                      style={{ background: G.surface2, border: `1px solid ${G.border}`, color: G.white, outline: 'none' }}
                    >
                      <option value="ALL">ALL</option>
                      {allTeams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Era</div>
                    <select
                      value={devEra}
                      onChange={e => setDevEra(e.target.value as Era)}
                      className="w-full px-3 py-2 text-sm font-semibold"
                      style={{ background: G.surface2, border: `1px solid ${G.border}`, color: G.gold, outline: 'none' }}
                    >
                      {ALL_ERAS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <Btn onClick={loadDevRoster} variant="outline" className="w-full py-3">
                    Load Roster
                  </Btn>
                  <Btn onClick={fillBalancedPreset} variant="gold" className="w-full py-3">
                    Best 9
                  </Btn>
                  <Btn onClick={fillRandom} variant="ghost" className="w-full py-3">
                    Random Fill
                  </Btn>
                  <Btn onClick={fillDevPreset} variant="ghost" className="w-full py-3">
                    Champ Nuggets
                  </Btn>
                  <Btn onClick={fillShootingTestPreset} variant="ghost" className="w-full py-3">
                    Shooting Test
                  </Btn>
                  <Btn onClick={fillGibbyPreset} variant="ghost" className="w-full py-3">
                    Gibby Roster
                  </Btn>

                  <div>
                    <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.grey }}>Search Player</div>
                    <input
                      type="text"
                      placeholder="Player name..."
                      value={devPlayerSearch}
                      onChange={e => setDevPlayerSearch(e.target.value)}
                      style={{ width: '100%', background: G.surface2, border: `1px solid ${G.border}`, color: G.white, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                    />
                    {devPlayerSearch.length > 1 && (
                      <div className="roster-scroll" style={{ background: G.surface2, border: `1px solid ${G.border}`, borderTop: 'none', maxHeight: 200, overflowY: 'auto' }}>
                        {players
                          .filter(p => p.full_name.toLowerCase().includes(devPlayerSearch.toLowerCase()))
                          .slice(0, 10)
                          .map(p => (
                            <div
                              key={p.person_id}
                              onClick={() => {
                                const tagged = applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyRings(applyFlexTag(withEraStats(p, p.era as Era, p.team_abbreviation)))))))
                                setLockedTeam(p.team_abbreviation)
                                setLockedEra(p.era as Era)
                                setSpinTeamDisplay(p.team_abbreviation)
                                setSpinEraDisplay(p.era as Era)
                                setRosterPool([tagged])
                                setSelectedPlayer(null); setPendingSlotIdx(null); setHighlightEmpty(false); setAwaitingSpin(false)
                                setDevPlayerSearch('')
                              }}
                              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: G.white, borderBottom: `1px solid ${G.border}` }}
                              onMouseEnter={e => (e.currentTarget.style.background = G.surface)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              {p.full_name}
                              <span style={{ color: G.greyDark, marginLeft: 8, fontSize: 11 }}>{p.position} - {eraLabel(p.era as Era)} - {p.team_abbreviation}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* ── Normal spin panel ── */
              <>
                {salaryCapMode && (
                  <div className="block sm:hidden" style={{ padding: '16px 16px 12px', textAlign: 'center', borderBottom: `1px solid ${G.border}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>Salary Cap Draft</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, letterSpacing: '0.04em', color: G.greyDark, marginBottom: 8 }}>
                      Build a team within tier limits. Draft <span style={{ color: '#9b6dff' }}>2 S</span> - <span style={{ color: '#C9A84C' }}>2 A</span> - <span style={{ color: '#4caf78' }}>2 B</span> - <span style={{ color: '#5b8fd4' }}>2 C</span> - <span style={{ color: '#c47a35' }}>1 D</span> tier players.
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.7, letterSpacing: '0.04em', color: G.greyDark }}>
                      Every spin guarantees at least one player from a tier you still need, but you can pick anyone from the roster. Build around your strengths.
                    </div>
                  </div>
                )}
                {salaryCapMode && (() => {
                  const TIER_COL: Record<PlayerTier, string> = { s: '#9b6dff', a: '#C9A84C', b: '#4caf78', c: '#5b8fd4', d: '#c47a35' }
                  const TIER_DESC: Record<PlayerTier, string> = { s: 'Superstars', a: 'Stars', b: 'Starters', c: 'Rotation', d: 'Role / Spec' }
                  return (
                    <div style={{ borderBottom: `1px solid ${G.border}`, padding: '10px 8px 8px' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: G.greyDark, marginBottom: 6, textAlign: 'center' }}>Salary Cap</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(Object.entries(CAP_QUOTAS) as [PlayerTier, number][]).map(([tier, quota]) => {
                          const filled = tierCounts[tier]
                          const done = filled >= quota
                          const col = TIER_COL[tier]
                          return (
                            <div key={tier} style={{ flex: 1, textAlign: 'center', border: `1px solid ${done ? col + '55' : G.border}`, background: done ? col + '10' : 'transparent', padding: '6px 4px 5px', transition: 'all 0.2s' }}>
                              <div style={{ ...BEBAS, fontSize: 28, lineHeight: 1, color: done ? col : '#333', transition: 'color 0.2s' }}>{tier.toUpperCase()}</div>
                              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', color: done ? col + 'cc' : G.greyDark, marginTop: 2 }}>{filled}/{quota}</div>
                              <div style={{ fontSize: 6, letterSpacing: '0.05em', color: done ? col + '88' : '#333', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{TIER_DESC[tier]}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
                <div className="grid grid-cols-2 gap-px" style={{ background: G.border }}>
                  <div className="py-5 text-center" style={{ background: G.surface }}>
                    <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: G.grey }}>Team</div>
                    <div style={{ ...BEBAS, fontSize: 36, color: spinning ? G.greyDark : G.white, letterSpacing: '0.05em' }}>
                      <span className="slot-reel-window">
                        <span
                          key={`team-${spinKey}`}
                          className={spinning || spinPhase === 'land' ? `slot-reel${spinPhase === 'slow' ? ' slot-reel--slow' : spinPhase === 'land' ? ' slot-reel--land' : ''}` : ''}
                        >
                          {spinTeamDisplay || '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="py-5 text-center" style={{ background: G.surface }}>
                    <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: G.grey }}>Era</div>
                    <div style={{ ...BEBAS, fontSize: 36, color: spinning ? G.greyDark : G.gold, letterSpacing: '0.05em' }}>
                      <span className="slot-reel-window">
                        <span
                          key={`era-${spinKey}`}
                          className={spinning || spinPhase === 'land' ? `slot-reel${spinPhase === 'slow' ? ' slot-reel--slow' : spinPhase === 'land' ? ' slot-reel--land' : ''}` : ''}
                        >
                          {spinEraDisplay ? eraLabel(spinEraDisplay) : '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Era filter */}
                <div style={{ borderBottom: `1px solid ${G.border}` }}>
                  {/* Toggle button */}
                  <button
                    onClick={() => { if (!eraFilterLocked) setShowEraFilter(v => !v) }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-widest"
                    style={{ background: 'none', border: 'none', cursor: eraFilterLocked ? 'default' : 'pointer', color: eraFilterLocked ? G.goldDim : G.greyDark, borderBottom: (showEraFilter || (eraFilterLocked && isCustomRange)) ? `1px solid ${G.border}` : 'none' }}
                  >
                    <span>Custom Range{eraFilterLocked ? (isCustomRange ? ` · ${eraFilter.size} eras locked` : ' · Locked') : ' (optional)'}</span>
                    {!eraFilterLocked && <span style={{ fontSize: 9 }}>{showEraFilter ? '▲' : '▼'}</span>}
                  </button>
                  {/* Collapsible panel */}
                  {(showEraFilter || (eraFilterLocked && isCustomRange)) && (
                    <>
                      <div className="flex justify-center flex-wrap px-2 pt-1 pb-0.5">
                        {ALL_ERAS.map(e => {
                          const on = eraFilter.has(e)
                          return (
                            <button
                              key={e}
                              disabled={eraFilterLocked}
                              onClick={() => setEraFilter(prev => {
                                const next = new Set(prev)
                                if (on && next.size === 1) return prev
                                on ? next.delete(e) : next.add(e)
                                return next
                              })}
                              className="shrink-0 text-xs uppercase tracking-widest"
                              style={{
                                padding: '6px 10px',
                                color: on ? G.gold : G.greyDark,
                                background: on ? `${G.gold}12` : 'none',
                                border: 'none',
                                borderBottom: on ? `2px solid ${G.gold}` : '2px solid transparent',
                                cursor: eraFilterLocked ? 'default' : 'pointer',
                                opacity: eraFilterLocked && !on ? 0.4 : 1,
                                transition: 'color 0.1s, background 0.1s',
                              }}
                            >{e}</button>
                          )
                        })}
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between gap-3">
                        <span className="text-xs" style={{ color: eraFilterLocked ? G.goldDim : G.greyDark, letterSpacing: '0.03em' }}>
                          {eraFilterLocked
                            ? `Locked. Excluding ${ALL_ERAS.length - eraFilter.size} era${ALL_ERAS.length - eraFilter.size !== 1 ? 's' : ''}. Will appear on result card. Not eligible for leaderboard.`
                            : 'Select eras, then lock to apply.'}
                        </span>
                        <button
                          onClick={() => { if (!eraFilterLocked && isCustomRange) setEraFilterLocked(true) }}
                          disabled={eraFilterLocked || !isCustomRange}
                          className="shrink-0 text-xs uppercase tracking-widest"
                          style={{
                            padding: '4px 12px',
                            background: eraFilterLocked ? `${G.gold}12` : isCustomRange ? `${G.gold}22` : 'transparent',
                            color: eraFilterLocked ? G.goldDim : isCustomRange ? G.gold : G.greyDark,
                            border: `1px solid ${eraFilterLocked ? G.goldDim : isCustomRange ? G.gold : G.border}`,
                            borderRadius: 2,
                            cursor: eraFilterLocked || !isCustomRange ? 'default' : 'pointer',
                            letterSpacing: '0.1em',
                            opacity: eraFilterLocked ? 0.6 : 1,
                          }}
                        >
                          {eraFilterLocked ? 'Locked' : 'Lock'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {eraFilterLocked && isCustomRange && (
                  <div className="text-xs text-center pb-2" style={{ color: G.greyDark }}>
                    Custom range active. Will <span style={{ color: '#CC8844' }}>not count</span> toward lifetime stats
                  </div>
                )}
                {filledCount === 9 ? (
                  <Btn onClick={() => onDraftComplete(slots, eraFilterLocked && eraFilter.size < ALL_ERAS.length ? [...eraFilter].sort((a, b) => ALL_ERAS.indexOf(a) - ALL_ERAS.indexOf(b)) : null, sandboxMode)} variant="gold" className="w-full py-4 text-base">
                    Draft Coach
                  </Btn>
                ) : (
                  <Btn
                    onClick={spin}
                    disabled={spinning || (rosterPool.length > 0 && respinUsed)}
                    variant="gold"
                    className={`w-full py-4 text-base${awaitingSpin ? ' spin-awaiting' : ''}`}
                  >
                    {spinning ? 'Spinning...' : 'Spin'}
                  </Btn>
                )}
                {awaitingSpin && !spinning && (
                  <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.goldDim }}>
                    {filledCount === 9 ? 'Draft your coach' : 'Spin for your next pick'}
                  </div>
                )}
                {!awaitingSpin && !spinning && !respinUsed && rosterPool.length > 0 && (
                  <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.goldDim }}>
                    1 re-spin remaining this draft
                  </div>
                )}
                {!awaitingSpin && !spinning && respinUsed && rosterPool.length > 0 && (
                  <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.grey }}>
                    No re-spins left. Pick from this roster
                  </div>
                )}
                {noPlayersMsg && !spinning && (
                  <div className="text-center text-xs uppercase tracking-[0.2em]" style={{ color: G.red }}>
                    All players from this combo drafted. Spin again
                  </div>
                )}
              </>
            )}

            {/* Roster list — only shown after a fresh spin, not while awaiting */}
            {rosterPool.length > 0 && !awaitingSpin && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <GoldLabel>{lockedTeam} - {lockedEra ? eraLabel(lockedEra) : ''}</GoldLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex" style={{ border: `1px solid ${G.border}`, borderRadius: 2 }}>
                      {(['G', 'F', 'C'] as const).map(pos => (
                        <button key={pos} onClick={() => setPosFilter(f => f === pos ? null : pos)}
                          className="text-xs uppercase tracking-widest"
                          style={{
                            padding: '3px 8px', border: 'none', cursor: 'pointer',
                            background: posFilter === pos ? `${G.gold}22` : 'transparent',
                            color: posFilter === pos ? G.gold : G.greyDark,
                            borderRight: pos !== 'C' ? `1px solid ${G.border}` : 'none',
                            transition: 'color 0.1s, background 0.1s',
                          }}
                        >{pos}</button>
                      ))}
                    </div>
                    <GoldLabel>{rosterPool.length}</GoldLabel>
                  </div>
                </div>
                <div className="roster-scroll" style={{ border: `1px solid ${G.border}`, maxHeight: 220, overflowY: 'auto', overflowX: 'hidden' }}>
                  {(() => {
                    const isSpecial = (p: Player) =>
                      p.greatest_75_flag === 'Y' || (p.rings ?? 0) > 0 || p.defAnchor || p.offAnchor || !!p.flexPositions || !!p.timeless || !!p.shootingStar || !!p.duoPartners?.length
                    const posMatch = (p: Player) => {
                      const primary = (p.position?.split('-')[0] ?? '').toLowerCase()
                      if (posFilter === 'G') return primary === 'guard'
                      if (posFilter === 'F') return primary === 'forward'
                      if (posFilter === 'C') return primary === 'center'
                      return false
                    }
                    const versionKey = (p: Player) => `${p.person_id}-${p.era}-${p.eraTeam ?? ''}`
                    const placedKeys = new Set(slots.filter(s => s.player).map(s => versionKey(s.player!)))
                    const sorted = [...rosterPool]
                    .filter(p => !placedKeys.has(versionKey(p)))
                    .filter(p => !posFilter || posMatch(p))
                    .sort((a, b) => {
                      if (sortBy === 'SPECIAL') {
                        const aS = isSpecial(a) ? 1 : 0; const bS = isSpecial(b) ? 1 : 0
                        if (bS !== aS) return bS - aS
                        return playerBaseRating(b, b.era as Era) - playerBaseRating(a, a.era as Era)
                      }
                      if (sortBy === 'FG3') {
                        const aQ = (a.FG3M ?? 0) >= 0.5, bQ = (b.FG3M ?? 0) >= 0.5
                        if (aQ !== bQ) return aQ ? -1 : 1
                        return (b.FG3_PCT ?? 0) - (a.FG3_PCT ?? 0)
                      }
                      if (sortBy === 'BASE') {
                        return playerBaseRating(b, b.era as Era) - playerBaseRating(a, a.era as Era)
                      }
                      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0)
                    }).filter(p => sortBy !== 'SPECIAL' || isSpecial(p))
                    visiblePoolRef.current = sorted
                    return sorted.map(p => {
                    const ts = (calcTS(p) * 100).toFixed(1)
                    const isSel = selectedPlayer?.person_id === p.person_id && selectedPlayer?.era === p.era && selectedPlayer?.eraTeam === p.eraTeam
                    const capBlocked = salaryCapMode && (() => { const t = playerTier(playerBaseRating(p, p.era as Era)); return tierCounts[t] >= CAP_QUOTAS[t] })()
                    return (
                      <button
                        key={`${p.person_id}-${p.era}-${p.eraTeam ?? ''}`}
                        id={`player-row-${p.person_id}`}
                        disabled={capBlocked}
                        onClick={() => { if (capBlocked) return; setSelectedPlayer(p); setHighlightEmpty(true); setPendingSlotIdx(null) }}
                        className={`w-full flex items-center gap-3 px-3 text-left roster-row${isSel ? ' roster-row--selected' : ''}`}
                        style={{
                          background: isSel ? `${G.gold}18` : G.surface,
                          borderBottom: `1px solid ${G.borderSub}`,
                          borderLeft: isSel ? `2px solid ${G.gold}` : '2px solid transparent',
                          paddingTop: 10, paddingBottom: 10,
                          transition: 'background 0.15s ease, border-left-color 0.15s ease, padding 0.15s ease',
                          opacity: capBlocked ? 0.3 : 1,
                          cursor: capBlocked ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={e => { if (!isSel && !capBlocked) { e.currentTarget.style.paddingTop = '14px'; e.currentTarget.style.paddingBottom = '14px'; } }}
                        onMouseLeave={e => { e.currentTarget.style.paddingTop = '10px'; e.currentTarget.style.paddingBottom = '10px'; }}
                      >
                        <PlayerHeadshot personId={p.person_id} size={36} initial={p.position?.[0]} lazy />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{p.full_name}</div>
                          <div className="text-xs" style={{ color: G.grey }}>{p.position}</div>
                        </div>
                        {salaryCapMode && (() => {
                          const tier = playerTier(playerBaseRating(p, p.era as Era))
                          const TIER_COL: Record<PlayerTier, string> = { s: '#9b6dff', a: '#C9A84C', b: '#4caf78', c: '#5b8fd4', d: '#c47a35' }
                          const col = TIER_COL[tier]
                          const needed = (neededTiers as string[]).includes(tier)
                          return (
                            <span style={{ ...BEBAS, fontSize: 18, lineHeight: 1, color: needed ? col : '#333', flexShrink: 0 }}>
                              {tier.toUpperCase()}
                            </span>
                          )
                        })()}
                        <div className="flex gap-3 text-xs shrink-0">
                          <span style={{ color: sortBy === 'PTS' ? G.gold : G.grey, fontWeight: sortBy === 'PTS' ? 700 : 400 }}>{p.PTS?.toFixed(1)}</span>
                          <span style={{ color: sortBy === 'REB' ? G.gold : G.grey, fontWeight: sortBy === 'REB' ? 700 : 400 }}>{p.REB?.toFixed(1)}</span>
                          <span style={{ color: sortBy === 'AST' ? G.gold : G.grey, fontWeight: sortBy === 'AST' ? 700 : 400 }}>{p.AST?.toFixed(1)}</span>
                          {sortBy === 'STL' ? (
                            <span style={{ color: G.gold, fontWeight: 700 }}>{(p.STL ?? 0).toFixed(1)}</span>
                          ) : sortBy === 'BLK' ? (
                            <span style={{ color: G.gold, fontWeight: 700 }}>{(p.BLK ?? 0).toFixed(1)}</span>
                          ) : sortBy === 'FG3' ? (
                            <span style={{ color: G.gold, fontWeight: 700 }}>{p.FG3_PCT != null ? (p.FG3_PCT * 100).toFixed(1) + '%' : '—'}</span>
                          ) : sortBy === 'BASE' ? (
                            <span style={{ color: G.gold, fontWeight: 700 }}>{playerBaseRating(p, p.era as Era).toFixed(1)}</span>
                          ) : (
                            <span style={{ color: G.greyDark }}>{ts}%</span>
                          )}
                        </div>
                      </button>
                    )
                  })})()}
                  {sortBy === 'SPECIAL' && !rosterPool.some(p =>
                    p.greatest_75_flag === 'Y' || (p.rings ?? 0) > 0 || p.defAnchor || p.offAnchor || !!p.flexPositions || !!p.timeless || !!p.shootingStar || !!p.duoPartners?.length
                  ) && (
                    <div className="text-center py-6 text-xs uppercase tracking-widest" style={{ color: G.greyDark }}>
                      No players with special tags
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-2" style={{ borderTop: `1px solid ${G.border}`, overflow: 'hidden' }}>
                  <span className="text-xs uppercase tracking-widest shrink-0 px-2" style={{ color: G.greyDark, borderRight: `1px solid ${G.border}`, paddingTop: 6, paddingBottom: 6 }}>Sort</span>
                  <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                    {([...['SPECIAL', 'PTS', 'REB', 'AST', 'FG3', 'STL', 'BLK'], ...(devMode ? ['BASE'] : [])] as ('SPECIAL' | 'PTS' | 'REB' | 'AST' | 'FG3' | 'STL' | 'BLK' | 'BASE')[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className="shrink-0 text-xs uppercase tracking-widest"
                        style={{
                          padding: '6px 10px',
                          color: sortBy === s ? G.gold : G.greyDark,
                          background: sortBy === s ? `${G.gold}12` : 'none',
                          border: 'none',
                          borderBottom: sortBy === s ? `2px solid ${G.gold}` : '2px solid transparent',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'color 0.1s, background 0.1s',
                        }}
                      >
                        {s === 'FG3' ? '3PT%' : s === 'SPECIAL' ? <><span className="hidden sm:inline">Tagged</span><span className="sm:hidden">★</span></> : s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:hidden px-2 pt-1 pb-0.5 text-xs" style={{ color: G.greyDark, opacity: 0.6 }}>★ = Tagged players</div>
              </div>
            )}

            {/* Hint: roster visible but no player selected yet */}
            {rosterPool.length > 0 && !selectedPlayer && !awaitingSpin && (
              <div className="text-center text-xs" style={{ color: G.greyDark, letterSpacing: '0.04em' }}>
                <span className="md:hidden">Select a player - then tap a slot to place</span>
                <span className="hidden md:inline">Select a player - then click a slot to place</span>
              </div>
            )}

            {capViolationMsg && (
              <div className="text-center text-xs py-2 px-4" style={{ color: '#FF6644', letterSpacing: '0.06em', fontWeight: 700 }}>
                {capViolationMsg}
              </div>
            )}

            {/* Selected player card */}
            {selectedPlayer && (
              <div className="space-y-2">
                <GoldLabel>
                  {pendingSlotIdx !== null
                    ? `→ ${slots[pendingSlotIdx].position}: lock or choose another slot`
                    : 'Click a court slot to place'}
                </GoldLabel>
                <PlayerCard player={selectedPlayer} displayEra={lockedEra ?? undefined} activeEra={lockedEra ?? undefined} devMode={devMode} fifties={fifties} duoActiveCount={selectedPlayer.duoPartners ? slots.filter(s => s.player && selectedPlayer.duoPartners!.includes(s.player.full_name)).length : 0} />
                {pendingSlotIdx !== null && (
                  <Btn onClick={confirmPick} variant="gold" className="w-full py-3">
                    Lock {slots[pendingSlotIdx].position}
                  </Btn>
                )}
              </div>
            )}

            {/* Roster card popup modal */}
            {rosterCardPlayer && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.75)' }}
                onClick={() => setRosterCardPlayer(null)}
              >
                <div onClick={e => e.stopPropagation()} className="w-full max-w-sm space-y-3">
                  <PlayerCard player={rosterCardPlayer} displayEra={lockedEra ?? undefined} activeEra={lockedEra ?? undefined} devMode={devMode} fifties={fifties} duoActiveCount={rosterCardPlayer.duoPartners ? slots.filter(s => s.player && rosterCardPlayer.duoPartners!.includes(s.player.full_name)).length : 0} />
                  <Btn variant="ghost" className="w-full py-2" onClick={() => setRosterCardPlayer(null)}>
                    Close
                  </Btn>
                </div>
              </div>
            )}

            {salaryCapMode && (
              <div className="hidden sm:block text-center py-6 px-4" style={{ color: G.greyDark, borderBottom: `1px solid ${G.border}` }}>
                <div style={{ maxWidth: 320, margin: '0 auto' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: G.gold, marginBottom: 10 }}>Salary Cap Draft</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, letterSpacing: '0.04em', color: G.greyDark, marginBottom: 12 }}>
                    Build a team within tier limits. Draft <span style={{ color: '#9b6dff' }}>2 S</span> - <span style={{ color: '#C9A84C' }}>2 A</span> - <span style={{ color: '#4caf78' }}>2 B</span> - <span style={{ color: '#5b8fd4' }}>2 C</span> - <span style={{ color: '#c47a35' }}>1 D</span> tier players.
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, letterSpacing: '0.04em', color: G.greyDark }}>
                    Every spin guarantees at least one player from a tier you still need, but you can pick anyone from the roster. Build around your strengths.
                  </div>
                </div>
              </div>
            )}

            {rosterPool.length === 0 && !spinning && !awaitingSpin && filledCount === 0 && !salaryCapMode && (
              <div className="text-center py-8 px-4" style={{ color: G.greyDark }}>
                {sandboxMode ? (
                  <span className="text-xs uppercase tracking-widest">Sandbox mode. Pick a team and era, then load roster. Or search for a player and load all of that player&apos;s cards.</span>
                ) : (
                  <span className="text-xs uppercase tracking-widest">Hit Spin to see a roster</span>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Court ── */}
          <div style={{ background: G.black, border: `1px solid ${G.border}`, padding: '20px' }}>

            {/* Mobile-only: bridge hint when player selected and court is below the fold */}
            {selectedPlayer && pendingSlotIdx === null && (
              <div className="sm:hidden text-center text-xs mb-3" style={{ color: G.goldDim, letterSpacing: '0.04em' }}>
                Tap a slot to place {selectedPlayer.full_name.split(' ')[0]}
              </div>
            )}
            {/* Empty-court onboarding hint */}
            {filledCount === 0 && rosterPool.length === 0 && !spinning && !awaitingSpin && (
              <div className="text-center text-xs mb-3" style={{ color: G.greyDark, opacity: 0.55, letterSpacing: '0.04em' }}>
                Spin a team roster - select players - fill all 9 slots
              </div>
            )}

            <div className="mb-4 text-center">
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: G.greyDark }}>Starting Five</div>
              <div className="text-xs mt-0.5" style={{ color: G.greyDark, opacity: 0.6, letterSpacing: '0.04em' }}>Starters - 35 min each</div>
            </div>
            <div className="mb-4 space-y-1.5">
              <div className="grid grid-cols-3 gap-1.5">
                {starterSlots.slice(0, 3).map((slot, i) => (
                  <CourtSlotView key={slot.position} slot={slot}
                    highlighted={!!selectedPlayer && !slot.player}
                    pendingPlayer={pendingSlotIdx === i ? selectedPlayer : null}
                    activePlayer={selectedPlayer} simEra={simEra}
                    sandboxMode={sandboxMode}
                    onRemove={slot.player ? () => removeSlotPlayer(i) : undefined}
                    onDragStart={sandboxMode ? () => setDraggedSlotIdx(i) : undefined}
                    fifties={fifties} onClick={() => previewSlot(i)}
                    onDrop={() => { if (sandboxMode && draggedSlotIdx !== null) { swapSlotPlayers(draggedSlotIdx, i); setDraggedSlotIdx(null) } else previewSlot(i) }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5" style={{ width: '66.67%', margin: '0 auto' }}>
                {starterSlots.slice(3, 5).map((slot, i) => (
                  <CourtSlotView key={slot.position} slot={slot}
                    highlighted={!!selectedPlayer && !slot.player}
                    pendingPlayer={pendingSlotIdx === i + 3 ? selectedPlayer : null}
                    activePlayer={selectedPlayer} simEra={simEra}
                    sandboxMode={sandboxMode}
                    onRemove={slot.player ? () => removeSlotPlayer(i + 3) : undefined}
                    onDragStart={sandboxMode ? () => setDraggedSlotIdx(i + 3) : undefined}
                    fifties={fifties} onClick={() => previewSlot(i + 3)}
                    onDrop={() => { if (sandboxMode && draggedSlotIdx !== null) { swapSlotPlayers(draggedSlotIdx, i + 3); setDraggedSlotIdx(null) } else previewSlot(i + 3) }} />
                ))}
              </div>
            </div>

            <div className="h-px mb-4" style={{ background: G.border }} />

            <div className="text-xs uppercase tracking-[0.2em] mb-3 text-center" style={{ color: G.greyDark }}>
              Bench
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-1">
              {benchSlots.map(slot => (
                <div key={slot.position} className="text-center" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
                  {SLOT_MPG[slot.position]} MIN
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {benchSlots.map((slot, i) => (
                <CourtSlotView key={slot.position} slot={slot}
                  highlighted={!!selectedPlayer && !slot.player}
                  pendingPlayer={pendingSlotIdx === i + 5 ? selectedPlayer : null} simEra={simEra}
                  sandboxMode={sandboxMode}
                  onRemove={slot.player ? () => removeSlotPlayer(i + 5) : undefined}
                  onDragStart={sandboxMode ? () => setDraggedSlotIdx(i + 5) : undefined}
                  fifties={fifties} onClick={() => previewSlot(i + 5)}
                  onDrop={() => { if (sandboxMode && draggedSlotIdx !== null) { swapSlotPlayers(draggedSlotIdx, i + 5); setDraggedSlotIdx(null) } else previewSlot(i + 5) }} />
              ))}
            </div>

            {/* Tag key */}
            <div className="mt-5 py-4 px-4" style={{ background: 'linear-gradient(160deg, #111111 0%, #0b0b0b 100%)', border: `1px solid ${G.border}`, borderRadius: 6 }}>
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: 3, height: 14, background: G.gold, borderRadius: 2 }} />
                <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: G.gold }}>Player Tag Effects</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { name: 'Champion',      color: G.gold,     desc: 'Elevates their game in the playoffs. The more championships, the bigger the boost.' },
                  { name: 'Def Anchor',    color: '#4A9ECC',  desc: 'Defensive impact beyond the stat sheet. T1 carries a larger boost than T2.' },
                  { name: 'Off Anchor',    color: G.gold,     desc: "Elevates the team's offense. T1 carries a larger boost than T2." },
                  { name: 'Flex',          color: '#4A9ECC',  desc: 'Fits multiple positions without penalty.' },
                  { name: 'Shooting Star', color: '#F472B6',  desc: 'Boosts team spacing. All-time shooters. T1 carries a larger boost than T2.' },
                  { name: 'Glass Cleaner', color: '#34D399',  desc: 'Elite rebounder. Boosts team second-chance points and limits opponent possessions.' },
                  { name: 'Timeless',      color: '#C084FC',  desc: 'Minimal era penalties across all decades. Minor penalty only if 6+ eras from home.' },
                  { name: 'Dynamic Duo',   color: '#4ECDC4',  desc: 'Draft both players to activate a +5 rating boost for each. Check the tooltip to see who the partner is.' },
                ].map(t => (
                  <div key={t.name} className="flex items-start gap-2.5 px-3 py-2 transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.02] cursor-default"
                    style={{ background: `${t.color}0f`, borderLeft: `2px solid ${t.color}`, borderRadius: 3 }}>
                    <span className="text-xs font-bold uppercase tracking-wide shrink-0" style={{ color: t.color, letterSpacing: '0.05em', minWidth: 78 }}>{t.name}</span>
                    <span className="text-xs leading-snug" style={{ color: '#b4b4b4' }}>{t.desc}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs mt-3 text-center italic" style={{ color: G.grey, opacity: 0.75, letterSpacing: '0.02em' }}>
                Scoring isn&apos;t everything. Defense, playmaking, and rebounding all shape your season.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
