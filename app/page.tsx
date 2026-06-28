'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { Player, Coach, CourtSlot, SlotPosition, Era, GamePhase, PlayerSeasonStats, PlayoffResult, PlayoffGame, PlayerRating } from '@eraball/engine'
import ResultCard from './ResultCard'
import LifetimeStatsModal from './LifetimeStatsModal'
import LeaderboardModal from './LeaderboardModal'
import AchievementsModal from './AchievementsModal'
import { recordRunComplete, getLifetimeStats } from '../lib/lifetimeStats'
import { checkAchievements, type Achievement } from '../lib/achievements'
// Anti-corruption service layer: the UI talks to these modules, never to supabase /
// fetch / proxy routes directly. Each degrades gracefully (live backend -> static fork).
import { submitEntry, type ScoreFlags } from '../services/leaderboard'
import { getShareCardHeadshots, getCoachHeadshot } from '../services/headshots'
import { loadGameData } from '../services/playerData'
// Shared presentational component library (pure, prop-driven, Storybook-cataloged).
// page.tsx keeps its own local G/BEBAS tokens, so only the components are imported here.
import { Btn, GoldLabel, GradeDisplay, TagTooltip, PlayerHeadshot, FooterLink, FooterButton, SupporterCard } from '../src/components'
import {
  ALL_ERAS, SLOT_POSITIONS, SLOT_MPG, ERA_SEASON_GAMES, calcFitPenalty, calcEraModifier, calcTeamRating,
  simulateSeason, simulatePlayoffs, calcTS, coachBonus, effectiveCoachBonus, coachChampBonus, playerMatchesEra, withEraStats, applyFlexTag, applyRings, applyAnchors, applyTimeless, applyShootingStar, applyGlassCleaner, applyDuo,
  firstRoundLabel, playerBaseRating, genOppTeamStats, calcTeamDefTotals, calcRebFactor,
  playerTier, CAP_QUOTAS,
} from '@eraball/engine'
import type { OppTeamStats, PlayerTier } from '@eraball/engine'
// Canonical design tokens (single source shared with the component library).
import { G, BEBAS } from '../src/components/tokens'
// Shared UI helper functions (display-only helpers, see module header).
import { shuffle, tierBg, fiftiesTierBorder, eraLabel, NBA_TEAMS, playerTeamForEra, emptySlots } from '../src/lib/ui'
// Shared app-level UI: game-specific view atoms and modals reused across feature screens.
import { CoachHeadshot, PlayerCard, CourtSlotView, HowToPlayModal, SupportersModal, SUPPORTERS, TopBar, PatchNotesModal } from './_shared'
// Feature screens (self-contained stateful modules under app/features/).
import { EraSelection } from './features/era-selection/EraSelection'
import { DraftScreen } from './features/draft/DraftScreen'
import { CoachDraftScreen } from './features/coach-draft/CoachDraftScreen'

// ─── Shared stats table ───────────────────────────────────────────────────────
const PLAYOFF_ROUND_LABELS = ['First Round', 'Semifinals', 'Conference Finals', 'NBA Finals']

function StatsTable({ stats, simEra, title, subtitle, teamActualPPG, teamActualOppPPG, oppStats, playoffGames, eraFilter }: {
  stats: PlayerSeasonStats[]; simEra: Era; title: string; subtitle: string; teamActualPPG?: number; teamActualOppPPG?: number; oppStats?: OppTeamStats | null; playoffGames?: import('../lib/types').PlayoffGame[]; eraFilter?: string
}) {
  const fifties = eraFilter === 'grayscale(1)'
  const [cardPlayer, setCardPlayer] = useState<Player | null>(null)

  const gameLog = cardPlayer && playoffGames
    ? playoffGames.map((g, gi) => {
        const line = g.playerLines?.find(l => l.personId === cardPlayer.person_id)
        return line ? { ...line, win: g.win, teamScore: g.teamScore, oppScore: g.oppScore, roundIndex: g.roundIndex, gameInSeries: g.gameInSeries, gameIdx: gi } : null
      }).filter(Boolean) as { pts: number; reb: number; ast: number; win: boolean; teamScore: number; oppScore: number; roundIndex: number; gameInSeries: number; gameIdx: number }[]
    : []

  return (
    <>
    {/* Player card modal */}
    {cardPlayer && typeof document !== 'undefined' && createPortal(
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
          zIndex: 9500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '48px 24px 24px', overflowY: 'auto',
        }}
        className="roster-scroll"
        onClick={e => { if (e.target === e.currentTarget) setCardPlayer(null) }}
      >
        <div style={{ width: '100%', maxWidth: 360, position: 'relative', filter: eraFilter ?? 'none' }}>
          <button
            onClick={() => setCardPlayer(null)}
            className="modal-close"
            style={{
              position: 'absolute', top: -40, right: 0, zIndex: 1,
              background: 'transparent', border: `1px solid ${G.border}`,
              color: G.grey, fontSize: 18, lineHeight: 1,
              width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
          <PlayerCard player={cardPlayer} activeEra={cardPlayer.era} fifties={fifties} duoActiveCount={cardPlayer.duoActiveCount ?? 0} />
          {gameLog.length > 0 && (
            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderTop: 'none', padding: '12px 16px' }}>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: G.grey }}>Playoff Game Log</div>
              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    {['Round', 'G', 'W/L', 'Score', 'PTS', 'REB', 'AST'].map(h => (
                      <th key={h} className="text-right py-1 px-1" style={{ color: G.greyDark, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: h === 'Round' ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameLog.map(g => (
                    <tr key={g.gameIdx} style={{ borderBottom: `1px solid ${G.borderSub}` }}>
                      <td className="py-1 px-1" style={{ color: G.greyDark }}>{PLAYOFF_ROUND_LABELS[g.roundIndex]?.replace('Conference Finals', 'Conf Finals').replace('First Round', 'R1').replace('Semifinals', 'Semis').replace('NBA Finals', 'Finals')}</td>
                      <td className="py-1 px-1 text-right" style={{ color: G.greyDark }}>G{g.gameInSeries}</td>
                      <td className="py-1 px-1 text-right" style={{ color: g.win ? '#4ade80' : '#f87171', fontWeight: 700 }}>{g.win ? 'W' : 'L'}</td>
                      <td className="py-1 px-1 text-right" style={{ color: G.greyDark }}>{g.teamScore}–{g.oppScore}</td>
                      <td className="py-1 px-1 text-right font-bold" style={{ color: G.gold }}>{g.pts}</td>
                      <td className="py-1 px-1 text-right" style={{ color: G.white }}>{g.reb}</td>
                      <td className="py-1 px-1 text-right" style={{ color: G.white }}>{g.ast}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    , document.body)}
    <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>
      <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="text-sm uppercase tracking-widest font-semibold text-white">{title}</div>
        <div className="text-xs mt-0.5" style={{ color: G.greyDark }}>{subtitle}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${G.border}` }}>
              {['Player', 'Slot', 'MPG', 'PPG', 'RPG', 'APG', 'SPG', 'BPG', 'TOV', 'TS%', 'FG%', '3P%', 'FT%'].map(h => (
                <th key={h} className={`py-2 px-3 uppercase tracking-widest font-normal ${h === 'Player' ? 'text-left' : 'text-right'}`} style={{ color: G.grey }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const simTS  = (s: typeof stats[0]) => {
                const baseTS  = s.player.TS_PCT ?? calcTS(s.player)
                const fgDelta = s.FG_PCT - (s.player.FG_PCT ?? 0.45)
                const ftDelta = s.FT_PCT - (s.player.FT_PCT ?? 0.70)
                return Math.min(0.85, Math.max(0.30, baseTS + fgDelta * 0.8 + ftDelta * 0.08))
              }
              const maxPTS = Math.max(...stats.map(s => s.PTS))
              const maxREB = Math.max(...stats.map(s => s.REB))
              const maxAST = Math.max(...stats.map(s => s.AST))
              const maxSTL = Math.max(...stats.map(s => s.STL))
              const maxBLK = Math.max(...stats.map(s => s.BLK))
              const maxTS  = Math.max(...stats.map(simTS))
              const maxFG  = Math.max(...stats.map(s => s.FG_PCT))
              const maxFG3 = Math.max(...stats.filter(s => s.FG3_PCT != null).map(s => s.FG3_PCT!))
              const maxFT  = Math.max(...stats.map(s => s.FT_PCT))
              return stats.map(s => {
              const isStarter = !s.slot.startsWith('B')
              const ts = simTS(s)
              const gl = (val: number, max: number) => val === max ? G.gold : G.grey
              return (
                <tr key={`${s.player.person_id}-${s.slot}`} style={{ borderBottom: `1px solid ${G.borderSub}` }}>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => setCardPlayer(s.player)}
                      className="font-medium text-left transition-colors"
                      style={{ color: isStarter ? G.white : G.grey, cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.color = G.gold)}
                      onMouseLeave={e => (e.currentTarget.style.color = isStarter ? G.white : G.grey)}
                    >
                      {s.player.full_name}
                      {s.player.era !== simEra && (
                        <span className="ml-1.5 text-xs" style={{ color: G.greyDark }}>{eraLabel(s.player.era)}</span>
                      )}
                    </button>
                  </td>
                  <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{s.slot}</td>
                  <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{s.MPG}</td>
                  <td className="py-2 px-3 text-right font-bold" style={{ color: gl(s.PTS, maxPTS) }}>{s.PTS.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(s.REB, maxREB) }}>{s.REB.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(s.AST, maxAST) }}>{s.AST.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(s.STL, maxSTL) }}>{s.STL.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(s.BLK, maxBLK) }}>{s.BLK.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right" style={{ color: G.grey }}>{s.TOV.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(ts, maxTS) }}>{(ts * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(s.FG_PCT, maxFG) }}>{(s.FG_PCT * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right" style={{ color: s.FG3_PCT != null ? gl(s.FG3_PCT, maxFG3) : G.grey }}>
                    {s.FG3_PCT != null ? `${(s.FG3_PCT * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right" style={{ color: gl(s.FT_PCT, maxFT) }}>{(s.FT_PCT * 100).toFixed(1)}%</td>
                </tr>
              )
            })})()}
            {(() => {
              if (stats.length === 0) return null
              const sum = (fn: (s: typeof stats[0]) => number) => stats.reduce((acc, s) => acc + fn(s), 0)
              const totalMPG = sum(s => s.MPG)
              // Percentages weighted by minutes
              const wFG  = sum(s => s.FG_PCT * s.MPG) / totalMPG
              const wFT  = sum(s => s.FT_PCT * s.MPG) / totalMPG
              const wTS  = sum(s => {
                const baseTS  = s.player.TS_PCT ?? calcTS(s.player)
                const fgDelta = s.FG_PCT - (s.player.FG_PCT ?? 0.45)
                const ftDelta = s.FT_PCT - (s.player.FT_PCT ?? 0.70)
                return Math.min(0.85, Math.max(0.30, baseTS + fgDelta * 0.8 + ftDelta * 0.08)) * s.MPG
              }) / totalMPG
              const fg3s = stats.filter(s => s.FG3_PCT != null)
              const wFG3MPG = fg3s.reduce((acc, s) => acc + s.MPG, 0)
              const wFG3 = wFG3MPG > 0 ? fg3s.reduce((acc, s) => acc + s.FG3_PCT! * s.MPG, 0) / wFG3MPG : null
              return (
                <>
                  <tr style={{ borderTop: `1px solid ${G.gold}55`, background: '#1a1a1a' }}>
                    <td className="py-2 px-3 font-bold uppercase tracking-widest text-xs" style={{ color: G.gold }}>Team</td>
                    <td className="py-2 px-3" />
                    <td className="py-2 px-3" />
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.gold }}>
                      {(teamActualPPG ?? sum(s => s.PTS)).toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.white }}>{sum(s => s.REB).toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.white }}>{sum(s => s.AST).toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>{sum(s => s.STL).toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>{sum(s => s.BLK).toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>{sum(s => s.TOV).toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>{(wTS * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>{(wFG * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>
                      {wFG3 != null ? `${(wFG3 * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.grey }}>{(wFT * 100).toFixed(1)}%</td>
                  </tr>
                  {teamActualOppPPG != null && (
                    <tr style={{ borderTop: `1px solid ${G.borderSub}`, background: '#0f0f0f' }}>
                      <td className="py-2 px-3 font-bold uppercase tracking-widest text-xs" style={{ color: G.greyDark }}>Opp</td>
                      <td className="py-2 px-3" /><td className="py-2 px-3" />
                      <td className="py-2 px-3 text-right font-bold" style={{ color: G.greyDark }}>{teamActualOppPPG.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats ? oppStats.REB.toFixed(1) : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats ? oppStats.AST.toFixed(1) : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats?.STL != null ? oppStats.STL.toFixed(1) : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats?.BLK != null ? oppStats.BLK.toFixed(1) : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats ? oppStats.TOV.toFixed(1) : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats ? (oppStats.TS_PCT * 100).toFixed(1) + '%' : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats ? (oppStats.FG_PCT * 100).toFixed(1) + '%' : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats?.FG3_PCT != null ? (oppStats.FG3_PCT * 100).toFixed(1) + '%' : '—'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: G.greyDark }}>{oppStats ? (oppStats.FT_PCT * 100).toFixed(1) + '%' : '—'}</td>
                    </tr>
                  )}
                </>
              )
            })()}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}

// ─── Playoff reaction lines ───────────────────────────────────────────────────
function getPlayoffReaction(
  game: { win: boolean; teamScore: number; oppScore: number; gameInSeries: number },
  seriesW: number,
  seriesL: number,
  seriesOver: boolean,
  champion: boolean,
  roundName: string
): string {
  const { win, teamScore: ts, oppScore: os, gameInSeries: n } = game
  const margin = Math.abs(ts - os)
  const seed = ts + os * 7 + n * 13
  const pick = (arr: string[]) => arr[seed % arr.length]

  if (champion && seriesOver) return pick([
    `WE ARE NBA CHAMPIONS!!!! We did it! UNBELIEVABLE!`,
    `CHAMPIONSHIP!!!! ${ts}-${os} and we are THE BEST IN THE WORLD!`,
    `I can't believe it... NBA CHAMPS! Game ${n}, ${ts}-${os}. Dreams come true!`,
  ])

  if (seriesOver && !win) return pick([
    `That's it... eliminated. Lost the series ${seriesW}-${seriesL}. Season's over.`,
    `Game ${n}, ${ts}-${os}. We fought so hard but it just wasn't enough. Gutted.`,
    `We're out ${seriesW}-${seriesL}. Ugh. That one's gonna hurt for a while.`,
  ])

  if (seriesOver && win) return pick([
    `YEAH! We took the ${roundName} ${seriesW}-${seriesL}! ONTO THE NEXT ROUND!`,
    `SERIES WIN! Game ${n} clincher ${ts}-${os}! ${seriesW}-${seriesL} and moving on!`,
    `WE ARE MOVING ON! ${roundName} is OURS! ${ts}-${os} in Game ${n}!`,
  ])

  if (win) {
    if (margin > 15) return pick([
      `OH YEAH! We CRUSHED them ${ts}-${os} in Game ${n}! That's what we do!`,
      `DOMINATION! Game ${n} goes our way ${ts}-${os}. They had no answer for us!`,
      `Easy work in Game ${n}! ${ts}-${os}. Series is ${seriesW}-${seriesL} our way!`,
    ])
    if (margin <= 5) return pick([
      `WHEW! Game ${n} was a BATTLE but we got it ${ts}-${os}! Series ${seriesW}-${seriesL}!`,
      `Too close for comfort... ${ts}-${os} in Game ${n} but a W is a W!`,
      `Heart was pounding the whole time. ${ts}-${os}, Game ${n} is ours!`,
    ])
    return pick([
      `Let's go! Game ${n} is ours, ${ts}-${os}! Series ${seriesW}-${seriesL}!`,
      `We got the W in Game ${n}, ${ts}-${os}. Keep building!`,
      `Game ${n} done! ${ts}-${os}. Feeling good about this series, ${seriesW}-${seriesL}!`,
    ])
  } else {
    if (margin > 15) return pick([
      `Oof. They blew us out ${ts}-${os} in Game ${n}. That was rough. Series ${seriesW}-${seriesL}.`,
      `They dominated us ${ts}-${os}. Game ${n} was ugly. We gotta wake up.`,
      `We had NOTHING tonight. Game ${n} loss ${ts}-${os}. Need to regroup badly.`,
    ])
    if (margin <= 5) return pick([
      `NOOO! Game ${n} slipped away ${ts}-${os}... just couldn't close. Series ${seriesW}-${seriesL}.`,
      `We were RIGHT there and let it slip. ${ts}-${os} in Game ${n}. One more play...`,
      `Game ${n} loss ${ts}-${os}. That one stings. We were so close. Series ${seriesW}-${seriesL}.`,
    ])
    return pick([
      `Lost Game ${n}, ${ts}-${os}. We know what we need to fix. Series ${seriesW}-${seriesL}.`,
      `Game ${n} goes their way, ${ts}-${os}. We'll come back stronger. Series ${seriesW}-${seriesL}.`,
      `Didn't have it in Game ${n}. ${ts}-${os}. Back to the drawing board.`,
    ])
  }
}

// ─── Awards ───────────────────────────────────────────────────────────────────

export interface AwardThresholds {
  mvpWins: number
  mvpBase: number
  mvpPPG: number
  allNBAAdj: number
  allNBAPPG: number
  allStarAdj: number
  allStarGPPG: number
  allStarFPPG: number
  allStarCPPG: number
  dpoyBase: number
  dpoySTL: number
  dpoyBLK: number
  sixthManPPG: number
  sixthManAdj: number
}

export const DEFAULT_THRESHOLDS: AwardThresholds = {
  mvpWins: 50, mvpBase: 55, mvpPPG: 24,
  allNBAAdj: 50, allNBAPPG: 24,
  allStarAdj: 48, allStarGPPG: 20, allStarFPPG: 20, allStarCPPG: 18,
  dpoyBase: 50, dpoySTL: 1.5, dpoyBLK: 1.5,
  sixthManPPG: 14, sixthManAdj: 48,
}

interface AwardEntry {
  award: string
  player: PlayerSeasonStats
  justification: string
  gold: boolean
}

function computeSeasonAwards(
  seasonStats: PlayerSeasonStats[],
  playerRatings: PlayerRating[],
  wins: number,
  t: AwardThresholds
): AwardEntry[] {
  const awards: AwardEntry[] = []
  const ratingMap = new Map(playerRatings.map(pr => [pr.player.person_id, pr]))
  const rated = seasonStats.map(s => ({
    s,
    adj: ratingMap.get(s.player.person_id)?.adjusted ?? 0,
    base: ratingMap.get(s.player.person_id)?.base ?? 0,
  }))

  // ── MVP ──
  if (wins >= 78) {
    // Historic season — highest-scoring starter above 22 PPG wins MVP automatically
    const starterSlots: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
    const topScorer = rated
      .filter(({ s }) => starterSlots.includes(s.slot) && s.PTS > 22)
      .sort((a, b) => b.s.PTS - a.s.PTS)[0]
    if (topScorer) {
      awards.push({
        award: 'League MVP',
        player: topScorer.s,
        justification: `${topScorer.s.PTS.toFixed(1)} PPG - ${topScorer.s.REB.toFixed(1)} RPG - ${topScorer.s.AST.toFixed(1)} APG`,
        gold: true,
      })
    }
  } else if (wins >= t.mvpWins) {
    const starterSlots: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
    const ratedStarters = rated.filter(({ s }) => starterSlots.includes(s.slot))
    const tdCandidate = ratedStarters.find(({ s }) =>
      (s.PTS > 20 && s.REB > 10 && s.AST > 10) || (s.PTS > 20 && s.AST > 10 && s.REB > 7)
    )
    const mvpCandidate = tdCandidate ?? ratedStarters
      .filter(({ s, base }) => base > t.mvpBase && s.PTS > t.mvpPPG)
      .sort((a, b) => b.base - a.base)[0]
    if (mvpCandidate) {
      awards.push({
        award: 'League MVP',
        player: mvpCandidate.s,
        justification: `${mvpCandidate.s.PTS.toFixed(1)} PPG - ${mvpCandidate.s.REB.toFixed(1)} RPG - ${mvpCandidate.s.AST.toFixed(1)} APG`,
        gold: true,
      })
    }
  }

  // ── All-NBA First Team ──
  const allNBASlots: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
  for (const pos of allNBASlots) {
    const best = rated
      .filter(({ s, adj }) => s.slot === pos && adj > t.allNBAAdj && s.PTS > t.allNBAPPG)
      .sort((a, b) => b.adj - a.adj)[0]
    if (best) {
      awards.push({
        award: `All-NBA - ${pos}`,
        player: best.s,
        justification: `${best.s.PTS.toFixed(1)} PPG - ${best.s.REB.toFixed(1)} RPG - ${best.s.AST.toFixed(1)} APG`,
        gold: false,
      })
    }
  }

  // ── All-Star ──
  const seasonGames = seasonStats[0]?.GP ?? 82
  const winPct = wins / seasonGames
  const badTeam = winPct <= 0.35
  const ppgFloor = (s: PlayerSeasonStats) => {
    if (!s.slot.startsWith('B')) {
      const sl = s.slot as SlotPosition
      return sl === 'PG' || sl === 'SG' ? t.allStarGPPG : sl === 'C' ? t.allStarCPPG : t.allStarFPPG
    }
    const pos = (s.player.position ?? '').toUpperCase()
    if (pos.includes('CENTER')) return t.allStarCPPG
    if (pos.includes('GUARD')) return t.allStarGPPG
    return t.allStarFPPG
  }
  for (const { s } of rated) {
    // Bad team penalty — must be historically dominant to qualify
    if (badTeam && s.PTS < 30 && s.REB < 20 && s.AST < 18) continue
    // Must hit statistical thresholds
    if (s.REB >= 18) {
      awards.push({ award: 'All-Star', player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} REB`, gold: false })
      continue
    }
    if (s.PTS <= ppgFloor(s)) continue
    // Centers under 20 PPG must have 10+ RPG
    const isCenter = s.slot === 'C' ||
      (!s.slot.startsWith('B') ? false : (s.player.position ?? '').toUpperCase().includes('CENTER'))
    if (isCenter && s.PTS < 20 && s.REB < 10) continue
    if (s.REB <= 7 && s.AST <= 7 && s.STL <= 1.8 && s.BLK <= 1.8) continue
    awards.push({
      award: 'All-Star',
      player: s,
      justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} REB - ${s.AST.toFixed(1)} AST`,
      gold: false,
    })
  }

  // ── 30 PPG All-Star guarantee ──
  for (const { s } of rated) {
    if (s.PTS >= 30) {
      const already = awards.some(a => a.award === 'All-Star' && a.player.player.person_id === s.player.person_id)
      if (!already) awards.push({ award: 'All-Star', player: s, justification: `${s.PTS.toFixed(1)} PPG`, gold: false })
    }
  }

  // ── 65-win All-Star guarantee ──
  if (wins > 65) {
    const topScorer = [...rated].sort((a, b) => b.s.PTS - a.s.PTS)[0]
    const alreadyAllStar = awards.some(a => a.award === 'All-Star' && a.player.player.person_id === topScorer?.s.player.person_id)
    if (topScorer && !alreadyAllStar) {
      awards.push({
        award: 'All-Star',
        player: topScorer.s,
        justification: `${topScorer.s.PTS.toFixed(1)} PPG - ${topScorer.s.REB.toFixed(1)} RPG - ${topScorer.s.AST.toFixed(1)} APG`,
        gold: false,
      })
    }
  }

  // ── 67-win All-Star guarantee ──
  if (wins >= 67) {
    for (const { s } of rated) {
      const alreadyAllStar = awards.some(a => a.award === 'All-Star' && a.player.player.person_id === s.player.person_id)
      if (alreadyAllStar) continue
      const qualifies =
        (s.PTS >= 19 && (s.AST >= 5 || s.STL >= 5 || s.BLK >= 5)) ||
        (s.PTS >= 18 && s.REB >= 10)
      if (qualifies) {
        const just = `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} RPG - ${s.AST.toFixed(1)} APG`
        awards.push({ award: 'All-Star', player: s, justification: just, gold: false })
      }
    }
  }

  // ── DPOY ──
  const dpoy = rated
    .filter(({ s, base }) =>
      base > t.dpoyBase && (
        (s.STL > t.dpoySTL && s.BLK > t.dpoyBLK) ||
        s.STL > 2.2 || s.BLK > 2.8 ||
        (s.BLK >= 2.5 && s.REB >= 12)
      )
    )
    .sort((a, b) => (b.s.STL + b.s.BLK + b.s.REB * 0.15) - (a.s.STL + a.s.BLK + a.s.REB * 0.15))[0]
  if (dpoy) {
    const isBigManPath = dpoy.s.BLK >= 2.5 && dpoy.s.REB >= 12
    awards.push({
      award: 'Defensive POY',
      player: dpoy.s,
      justification: isBigManPath
        ? `${dpoy.s.BLK.toFixed(1)} BLK - ${dpoy.s.REB.toFixed(1)} REB - ${dpoy.s.STL.toFixed(1)} STL`
        : `${dpoy.s.STL.toFixed(1)} STL - ${dpoy.s.BLK.toFixed(1)} BLK`,
      gold: false,
    })
  }

  // ── 6th Man ──
  const benchSorted = rated.filter(({ s }) => s.slot.startsWith('B')).sort((a, b) => b.adj - a.adj)
  const sixthMan = benchSorted.slice(0, 2).find(({ s, adj }) => s.PTS > t.sixthManPPG && adj > t.sixthManAdj)
  if (sixthMan) {
    awards.push({
      award: '6th Man of the Year',
      player: sixthMan.s,
      justification: `${sixthMan.s.PTS.toFixed(1)} PPG - ${sixthMan.s.REB.toFixed(1)} RPG - ${sixthMan.s.AST.toFixed(1)} APG`,
      gold: false,
    })
  }

  return awards
}

function computeFinalsMVP(finalsStats: PlayerSeasonStats[]): PlayerSeasonStats | null {
  if (!finalsStats.length) return null
  const sorted = [...finalsStats].sort((a, b) => b.PTS !== a.PTS ? b.PTS - a.PTS : b.AST - a.AST)
  const eligible = sorted.filter(s => !s.slot.startsWith('B') || s.PTS >= 28 || s.REB >= 20)
  return eligible[0] ?? sorted[0]
}

function SeasonAwardsPanel({ awards }: { awards: AwardEntry[] }) {
  return (
    <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>
      <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="text-sm uppercase tracking-widest font-semibold text-white">Season Awards</div>
      </div>
      {awards.length === 0 ? (
        <div className="px-5 py-4 text-xs uppercase tracking-widest" style={{ color: G.greyDark }}>
          No major awards this season
        </div>
      ) : (
        <div>
          {awards.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: `1px solid ${G.borderSub}` }}
            >
              <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: a.gold ? G.gold : G.grey }}>
                {a.award}
              </div>
              <div className="text-right">
                <div className="text-xs font-medium" style={{ color: a.gold ? G.gold : G.white }}>
                  {a.player.player.full_name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: G.greyDark }}>{a.justification}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Phase 4: Simulation ──────────────────────────────────────────────────────
function SimulationScreen({ slots, coach, simEra, onRestart, greyscaleBtn, muteBtn, sandboxMode, salaryCapMode, customEraRange, eraFilter, onAchievementsUnlocked }: {
  slots: CourtSlot[]; coach: Coach; simEra: Era; onRestart: () => void; greyscaleBtn?: React.ReactNode; muteBtn?: React.ReactNode; sandboxMode?: boolean; salaryCapMode?: boolean; customEraRange?: Era[] | null; eraFilter?: string; onAchievementsUnlocked?: (a: Achievement[]) => void
}) {
  const seasonGames = ERA_SEASON_GAMES[simEra]
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  // ── Regular season ──
  const [simStarted, setSimStarted] = useState(false)
  const [games, setGames] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const [seasonStats, setSeasonStats] = useState<PlayerSeasonStats[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Season actual scores ──
  const [avgTeamScore, setAvgTeamScore] = useState<number | null>(null)
  const [avgOppScore, setAvgOppScore] = useState<number | null>(null)
  const [seasonOppStats, setSeasonOppStats] = useState<OppTeamStats | null>(null)
  const [playoffOppStats, setPlayoffOppStats] = useState<OppTeamStats | null>(null)
  const [teamAnalysis, setTeamAnalysis] = useState<{ spacingWinFactor: number; shooterCount: number; spacingBaseline: number; isPreThreePt: boolean; highVolumeShooterCount: number; rebFactor: number; blkScore: number; astFactor: number } | null>(null)

  // ── Playoffs ──
  const [playoffStarted, setPlayoffStarted] = useState(false)
  const [playoffRevealIndex, setPlayoffRevealIndex] = useState(-1)
  const [playoffDone, setPlayoffDone] = useState(false)
  const [playoffResult, setPlayoffResult] = useState<PlayoffResult | null>(null)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [selectedGame, setSelectedGame] = useState<{ game: PlayoffGame; roundName: string; gameNum: number } | null>(null)
  const [selectedBracketRound, setSelectedBracketRound] = useState<number | null>(null)

  // ── Headshots ──
  const [headshots, setHeadshots] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (!seasonStats.length) return
    const starters = seasonStats.filter(s => !s.slot.startsWith('B'))
    // Share-card headshots route through the headshots service (proxy fetch -> base64 data
    // URL, null on failure). Caller renders the slot-initial placeholder on null.
    getShareCardHeadshots(starters.map(s => s.player.person_id)).then(setHeadshots)
  }, [seasonStats])

  // ── Share card ──
  const cardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [shareHint, setShareHint] = useState<string | null>(null)

  // ── Leaderboard submission ──
  const lbTeamNameRef = useRef<HTMLInputElement>(null)
  const [lbSubmitted, setLbSubmitted] = useState(false)
  const [lbSubmitting, setLbSubmitting] = useState(false)
  const [lbScore, setLbScore] = useState<number | null>(null)
  const [lbRank, setLbRank] = useState<number | null>(null)
  const [lbError, setLbError] = useState<string | null>(null)

  const PROFANITY_RE = /nigger|nigga|nigg(a|er|ers|as)|chink|spick?|wetback|faggot|fag|cunt|kike|tranny|retard|rape|rapist/i

  const handleLeaderboardSubmit = async () => {
    const lbTeamName = lbTeamNameRef.current?.value.trim() ?? ''
    if (!lbTeamName || lbSubmitting || lbSubmitted) return
    if (PROFANITY_RE.test(lbTeamName)) {
      setLbError('Team name not allowed. Please choose a different name.')
      return
    }
    setLbError(null)
    setLbSubmitting(true)
    const draftedPlayers = slots.filter(s => s.player).map(s => s.player!)
    const no_timeless = !draftedPlayers.some(p => p.timeless)
    const no_s_tier = !draftedPlayers.some(p => playerTier(playerBaseRating({ ...p, duoActiveCount: 0 }, simEra!)) === 's')
    const BLK_BASELINE = 3.5
    const elite_spacing   = !teamAnalysis?.isPreThreePt && ((teamAnalysis?.spacingWinFactor ?? 1) - 1) * 100 >= 5
    const elite_rim       = (teamAnalysis?.blkScore ?? 0) >= BLK_BASELINE * 1.5
    const elite_playmaking = ((teamAnalysis?.astFactor ?? 1) - 1) * 100 > 3
    const reb_edge        = ((teamAnalysis?.rebFactor ?? 1) - 1) * 100 > 5
    const draftedNames = new Set(draftedPlayers.map(p => p.full_name))
    const duoAdj: Record<string, string[]> = {}
    for (const p of draftedPlayers) {
      if (p.duoPartners) duoAdj[p.full_name] = p.duoPartners.filter(n => draftedNames.has(n))
    }
    const duo_pair = draftedPlayers.some(p => (duoAdj[p.full_name]?.length ?? 0) > 0)
    let duo_trio = false
    if (duo_pair) {
      const visited = new Set<string>()
      for (const p of draftedPlayers) {
        if (visited.has(p.full_name) || !duoAdj[p.full_name]?.length) continue
        const queue = [p.full_name]; visited.add(p.full_name); let size = 0
        while (queue.length) {
          const curr = queue.shift()!; size++
          for (const nb of duoAdj[curr] ?? []) { if (!visited.has(nb)) { visited.add(nb); queue.push(nb) } }
        }
        if (size >= 3) { duo_trio = true; break }
      }
    }
    const playoffWins = playoffResult ? playoffResult.rounds.reduce((s, r) => s + r.seriesWins, 0) : 0
    const playoffLosses = playoffResult ? playoffResult.rounds.reduce((s, r) => s + r.seriesLosses, 0) : 0
    const playoffTotal = playoffWins + playoffLosses
    const roundName = playoffResult?.rounds.at(-1)?.name
    const playoffResultKey = !madePlayoffs ? null
      : playoffResult?.champion ? 'champion'
      : roundName === 'NBA Finals' ? 'finals'
      : roundName === 'Conference Finals' ? 'conf_finals'
      : roundName === 'Semifinals' ? 'second_round'
      : 'first_round'
    const entry = {
      era: simEra ?? 'unknown',
      mode: (salaryCapMode ? 'salary_cap' : 'normal') as 'normal' | 'salary_cap',
      team_name: lbTeamName.trim(),
      reg_wins: wins,
      reg_losses: losses,
      reg_win_pct: wins / Math.max(wins + losses, 1),
      playoff_wins: playoffWins,
      playoff_losses: playoffLosses,
      playoff_win_pct: playoffTotal > 0 ? playoffWins / playoffTotal : 0,
      playoff_result: playoffResultKey,
      avg_pt_diff: avgTeamScore != null && avgOppScore != null ? Math.round((avgTeamScore - avgOppScore) * 100) / 100 : 0,
      team_rating: Math.round(tr),
      coach_name: coach.name.replace('*', ''),
      coach_grade: coach.overallGrade,
    }
    const roster = {
      starters: slots.slice(0, 5).filter(s => s.player).map(s => ({
        slot: s.position,
        name: s.player!.full_name,
        era: s.player!.era as string,
      })),
      bench: slots.slice(5).filter(s => s.player).map(s => ({
        name: s.player!.full_name,
        era: s.player!.era as string,
      })),
    }
    const bad_coach = playoffResultKey === 'champion' && entry.coach_grade === 'F'
    const flags: ScoreFlags = { no_timeless, no_s_tier, elite_spacing, elite_rim, elite_playmaking, reb_edge, duo_pair, duo_trio, bad_coach }
    // submitEntry routes through the leaderboard service: live /api/submit when a backend
    // is reachable, else a local-only score+rank computed with the identical formula.
    // It never throws, so the success path below always runs (the static fork has no
    // server to reject a submission). A try/catch still guards unexpected failures so the
    // original error UX is preserved if the service ever rejects.
    let score: number
    let rank: number
    try {
      const result = await submitEntry(entry, roster, flags)
      score = result.score
      rank = result.rank
    } catch {
      setLbError('Submission failed')
      setLbSubmitting(false)
      return
    }
    try {
      const saved = JSON.parse(localStorage.getItem('eraball_personal_entries') ?? '[]')
      saved.push({ ...entry, score, roster, created_at: new Date().toISOString() })
      saved.sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      localStorage.setItem('eraball_personal_entries', JSON.stringify(saved.slice(0, 100)))
    } catch {}
    setLbScore(score)
    setLbRank(rank)
    setLbSubmitted(true)
    setLbSubmitting(false)
  }

  const handleShare = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      await document.fonts.ready
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
        logging: false,
        // Do NOT pass width/height — with scale:2, passing height:1080 only
        // captures 540 CSS px (1080÷2) and stretches it, cutting the bottom half.
        // Let html2canvas auto-size to element (1080×1080) × scale:2 = 2160×2160.
        onclone: (_doc: Document, el: HTMLElement) => {
          // Fix the PARENT WRAPPER too — otherwise the card is still at -1100px
          // inside the fixed wrapper even though el is repositioned.
          const wrapper = el.parentElement
          if (wrapper) {
            wrapper.style.position = 'absolute'
            wrapper.style.top = '0'
            wrapper.style.left = '0'
            wrapper.style.zIndex = '0'
          }
          el.style.position = 'relative'
          el.style.top = 'auto'
          el.style.left = 'auto'
          el.style.zIndex = '0'
        },
      })
      // Downscale the 2160×2160 hi-res canvas back to 1080×1080 for sharing
      const out = document.createElement('canvas')
      out.width = 1080
      out.height = 1080
      out.getContext('2d')!.drawImage(canvas, 0, 0, 1080, 1080)
      setShareImageUrl(out.toDataURL('image/png'))
    } catch (e) {
      console.error('Share card failed:', e)
      alert('Could not generate image. Try again.')
    } finally {
      setSharing(false)
    }
  }

  const handleDownload = () => {
    if (!shareImageUrl) return
    const link = document.createElement('a')
    link.download = `eraball-${simEra}-${wins}-${losses}.png`
    link.href = shareImageUrl
    link.click()
  }

  const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://eraball.app'

  const slotsWithDuo = slots.map(slot => {
    if (!slot.player?.duoPartners) return slot
    const duoActiveCount = slots.filter(s => s !== slot && s.player && slot.player!.duoPartners!.includes(s.player.full_name)).length
    return { ...slot, player: { ...slot.player, duoActiveCount } }
  })
  const { teamRating: tr, rawRating, playerRatings: pr } = calcTeamRating(slotsWithDuo, coach, simEra)
  // rawRating with champ bonus on the team side — passed to sims so off/def apply separately
  const simRaw = rawRating * (1 + coachChampBonus(coach))

  type BatchRun = { wins: number; losses: number; roundsWon: number; champion: boolean }
  const [batchResults, setBatchResults] = useState<BatchRun[] | null>(null)

  const runBatch = (n = 10) => {
    const runs: BatchRun[] = []
    for (let i = 0; i < n; i++) {
      const { games: allGames } = simulateSeason(simRaw, pr, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, 'def'), effectiveCoachBonus(coach, 'off'), salaryCapMode ? 0.90 : 1.0)
      const w = allGames.filter(Boolean).length
      const l = allGames.length - w
      const playoff = simulatePlayoffs(simRaw, pr, w, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, 'def'), effectiveCoachBonus(coach, 'off'), salaryCapMode ? 0.90 : 1.0)
      runs.push({ wins: w, losses: l, roundsWon: playoff.rounds.filter(r => r.advanced).length, champion: playoff.champion })
    }
    setBatchResults(runs)
  }

  const startSim = () => {
    setSimStarted(true); setGames([]); setDone(false); setSeasonStats([])
    const { games: allGames, seasonStats: stats, avgTeamScore: ats, avgOppScore: aos, teamAnalysis: ta } = simulateSeason(simRaw, pr, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, 'def'), effectiveCoachBonus(coach, 'off'), salaryCapMode ? 0.90 : 1.0)
    setSeasonStats(stats)
    setAvgTeamScore(ats)
    setAvgOppScore(aos)
    setTeamAnalysis(ta)
    const { stl: teamSTL, blk: teamBLK } = calcTeamDefTotals(pr)
    const rebEntries = pr.map(r => ({ pr: r, minScale: SLOT_MPG[r.slot] / 35 }))
    setSeasonOppStats(genOppTeamStats(aos, simEra, teamSTL, teamBLK, calcRebFactor(rebEntries, simEra)))
    let idx = 0
    intervalRef.current = setInterval(() => {
      setGames(allGames.slice(0, ++idx))
      if (idx >= seasonGames) { clearInterval(intervalRef.current!); setDone(true) }
    }, 50)
  }

  const startPlayoffs = () => {
    setPlayoffStarted(true)
    setPlayoffRevealIndex(-1)
    setPlayoffDone(false)
    setAutoAdvance(false)
    const result = simulatePlayoffs(simRaw, pr, wins, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, 'def'), effectiveCoachBonus(coach, 'off'), salaryCapMode ? 0.90 : 1.0)
    setPlayoffResult(result)
    const poAvgOpp = result.allGames.reduce((s, g) => s + g.oppScore, 0) / result.allGames.length
    const { stl: poTeamSTL, blk: poTeamBLK } = calcTeamDefTotals(pr)
    const poRebEntries = pr.map(r => ({ pr: r, minScale: SLOT_MPG[r.slot] / 35 }))
    setPlayoffOppStats(genOppTeamStats(poAvgOpp, simEra, poTeamSTL, poTeamBLK, calcRebFactor(poRebEntries, simEra)))
    setTimeout(() => setPlayoffRevealIndex(0), 400)
  }

  const skipPlayoffs = () => {
    if (!playoffResult) return
    setPlayoffRevealIndex(playoffResult.allGames.length)
    setPlayoffDone(true)
  }

  const nextGame = () => {
    if (!playoffResult || playoffDone) return
    const next = playoffRevealIndex + 1
    if (next >= playoffResult.allGames.length) {
      setPlayoffRevealIndex(playoffResult.allGames.length)
      setPlayoffDone(true)
    } else {
      setPlayoffRevealIndex(next)
    }
  }

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  // Auto-advance playoff reveal one game at a time
  useEffect(() => {
    if (!playoffResult || !playoffStarted || playoffRevealIndex < 0) return
    if (playoffRevealIndex >= playoffResult.allGames.length) {
      setPlayoffDone(true)
      return
    }
    // Always show the first game automatically, then pause unless autoAdvance is on
    if (!autoAdvance && playoffRevealIndex > 0) return
    const delay = playoffRevealIndex === 0 ? 500 : 600
    const timer = setTimeout(() => setPlayoffRevealIndex(i => i + 1), delay)
    return () => clearTimeout(timer)
  }, [playoffRevealIndex, playoffStarted, playoffResult, autoAdvance])


  const wins = games.filter(Boolean).length
  const losses = games.length - wins
  const playoffThreshold = Math.ceil(seasonGames / 2)
  const madePlayoffs = wins >= playoffThreshold

  const playoffOutcome = (() => {
    if (!madePlayoffs) return 'missed the playoffs'
    if (!playoffResult || !playoffDone) return ''
    if (playoffResult.champion) return 'NBA Champions'
    const last = playoffResult.rounds[playoffResult.rounds.length - 1]
    if (!last) return ''
    const shortName: Record<string, string> = {
      'First Round': 'First Round exit',
      'Semifinals': 'Semifinals exit',
      'Conference Finals': 'Conference Finals exit',
      'NBA Finals': 'Finals exit',
    }
    return shortName[last.name] ?? `${last.name} exit`
  })()

  const SHARE_MSG = `My NBA lineup I drafted on EraBall: ${wins}-${losses} record, ${playoffOutcome}. Think you can do better?`

  const handleShareTwitter = async () => {
    if (!shareImageUrl) return
    const blob = await (await fetch(shareImageUrl)).blob()
    const file = new File([blob], 'eraball-team.png', { type: 'image/png' })

    // Mobile: native share sheet lets user pick Twitter with image attached
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: 'EraBall', text: SHARE_MSG, files: [file] })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }

    // Desktop: Twitter intent can't receive images via URL.
    // Download the image so the user can attach it manually, then open the intent.
    handleDownload()
    const tweetText = encodeURIComponent(`${SHARE_MSG}\n\n${SITE_URL}`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
    setShareHint('Image downloaded. Attach it to your tweet using the image icon')
    setTimeout(() => setShareHint(null), 9000)
  }

  const handleShareWhatsApp = async () => {
    if (shareImageUrl && navigator.canShare) {
      try {
        const blob = await (await fetch(shareImageUrl)).blob()
        const file = new File([blob], 'eraball-team.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'EraBall', text: SHARE_MSG, url: SITE_URL, files: [file] })
          return
        }
      } catch {}
    }
    const text = encodeURIComponent(`${SHARE_MSG} ${SITE_URL}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleShareSMS = async () => {
    if (shareImageUrl && navigator.canShare) {
      try {
        const blob = await (await fetch(shareImageUrl)).blob()
        const file = new File([blob], 'eraball-team.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'EraBall', text: SHARE_MSG, url: SITE_URL, files: [file] })
          return
        }
      } catch {}
    }
    window.location.href = `sms:?body=${encodeURIComponent(`${SHARE_MSG} ${SITE_URL}`)}`
  }

  const verdict = wins === seasonGames ? 'Perfect Season' : wins === 0 ? 'Winless Season' : wins >= Math.round(seasonGames * 0.73) ? 'Championship Contender' : wins >= Math.round(seasonGames * 0.61) ? 'Playoff Team' : wins >= playoffThreshold ? '.500 Season' : 'Lottery Bound'

  const dispRating = (r: number) => Math.round(r + 15)

  const gradeBonus = (g: 'A' | 'B' | 'C' | 'D' | 'F') =>
    `${coachBonus(g) >= 0 ? '+' : ''}${(coachBonus(g) * 100).toFixed(0)}%`

  const ROUND_NAMES = ['First Round', 'Semifinals', 'Conference Finals', 'NBA Finals']

  // Derive playoff display state from reveal index
  const revealedGames = (playoffResult && playoffRevealIndex >= 0) ? playoffResult.allGames.slice(0, playoffRevealIndex) : []
  const currentGame = playoffRevealIndex > 0 && playoffResult ? playoffResult.allGames[playoffRevealIndex - 1] : null
  const liveRounds = ROUND_NAMES.map((name, ri) => {
    const rGames = revealedGames.filter(g => g.roundIndex === ri)
    const w = rGames.filter(g => g.win).length
    const l = rGames.filter(g => !g.win).length
    return { name, rGames, w, l, complete: w === 4 || l === 4, advanced: w === 4 }
  })
  const visibleRounds = liveRounds.filter(r => r.rGames.length > 0)

  // Current series progress for the active game
  const currentRoundLive = currentGame ? liveRounds[currentGame.roundIndex] : null
  const seriesW = currentRoundLive?.w ?? 0
  const seriesL = currentRoundLive?.l ?? 0
  const seriesOver = currentRoundLive ? (seriesW === 4 || seriesL === 4) : false

  const allDone = done && (playoffDone || !madePlayoffs)

  const savedRun = useRef(false)
  useEffect(() => {
    if (!allDone || sandboxMode || customEraRange || savedRun.current) return
    savedRun.current = true
    const starters = slots.slice(0, 5).filter(s => s.player).map(s => ({ personId: s.player!.person_id, name: s.player!.full_name }))
    const bench    = slots.slice(5).filter(s => s.player).map(s => ({ personId: s.player!.person_id, name: s.player!.full_name }))
    const hasSTierStarter = slots.slice(0, 5).some(s => s.player && playerTier(playerBaseRating(s.player, simEra)) === 's')
    const runMode: 'normal' | 'salary_cap' = salaryCapMode ? 'salary_cap' : 'normal'
    recordRunComplete({
      era: simEra,
      wins,
      losses,
      champion: playoffResult?.champion ?? false,
      teamRating: Math.round(tr + 15),
      starters,
      bench,
      coach: coach.name,
      mode: runMode,
      hasSTierStarter,
    })
    const draftedPlayers = slots.filter(s => s.player).map(s => s.player!)
    const draftedNames = new Set(draftedPlayers.map(p => p.full_name))
    const duoAdj: Record<string, string[]> = {}
    for (const p of draftedPlayers) {
      if (p.duoPartners) duoAdj[p.full_name] = p.duoPartners.filter(n => draftedNames.has(n))
    }
    const duo_pair = draftedPlayers.some(p => (duoAdj[p.full_name]?.length ?? 0) > 0)
    let duo_trio = false
    if (duo_pair) {
      const visited = new Set<string>()
      for (const p of draftedPlayers) {
        if (visited.has(p.full_name) || !duoAdj[p.full_name]?.length) continue
        const queue = [p.full_name]; visited.add(p.full_name); let size = 0
        while (queue.length) {
          const curr = queue.shift()!; size++
          for (const nb of duoAdj[curr] ?? []) { if (!visited.has(nb)) { visited.add(nb); queue.push(nb) } }
        }
        if (size >= 3) { duo_trio = true; break }
      }
    }
    const newAchievements = checkAchievements(
      getLifetimeStats('normal'),
      getLifetimeStats('salary_cap'),
      { era: simEra, mode: runMode, wins, losses, champion: playoffResult?.champion ?? false, teamRating: Math.round(tr + 15), coachGrade: coach.overallGrade, hasSTierStarter, duo_pair, duo_trio },
    )
    if (newAchievements.length > 0) onAchievementsUnlocked?.(newAchievements)
  }, [allDone])

  const seasonAwards = done && seasonStats.length > 0
    ? computeSeasonAwards(seasonStats, pr, wins, DEFAULT_THRESHOLDS)
    : []

  const finalsMVP = playoffDone && playoffResult?.champion && playoffResult.finalsStats.length > 0
    ? computeFinalsMVP(playoffResult.finalsStats)
    : null


  return (
    <div className="min-h-screen" style={{ background: G.black }}>
      <TopBar onRestart={onRestart} right={
        <div className="flex items-center gap-2 sm:gap-4">
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="hidden sm:inline">Era: </span><span style={{ color: G.white }}>{eraLabel(simEra)}</span>
            <span className="mx-1 sm:mx-3" style={{ color: G.border }}>·</span>
            <span className="hidden sm:inline">Coach: </span><span style={{ color: G.white }}><span className="sm:hidden">{coach.name.split(' ').slice(-1)[0]}</span><span className="hidden sm:inline">{coach.name}</span></span>
          </span>
          {greyscaleBtn}
          {muteBtn}
        </div>
      } />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Rating breakdown */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
            <div className="text-sm uppercase tracking-widest font-semibold text-white">Team Rating</div>
            <div className="flex items-center gap-4">
              <span style={{ ...BEBAS, fontSize: 28, color: G.gold }}>{dispRating(tr)}</span>
              <span className="text-xs" style={{ color: G.grey }}>
                Off {coach.offGuru ? '+6%' : gradeBonus(coach.offGrade)} - Def {coach.defGuru ? '+6%' : gradeBonus(coach.defGrade)}
                {coach.champ > 0 && <span style={{ color: G.goldDim, marginLeft: 6 }}>+{(coachChampBonus(coach) * 100).toFixed(1)}% coach titles</span>}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                  {['Player', 'Slot', 'Base', 'Era', 'Fit', 'Rating'].map(h => (
                    <th key={h} className={`py-2 px-3 uppercase tracking-widest font-normal ${h === 'Player' ? 'text-left' : 'text-right'}`} style={{ color: G.grey }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pr.map(({ player, slot, base, adjusted, fitPenalty, eraMod }) => (
                  <tr key={`${player.person_id}-${slot}`} style={{ borderBottom: `1px solid ${G.borderSub}` }}>
                    <td className="py-2 px-3 text-white font-medium">{player.full_name}</td>
                    <td className="py-2 px-3 text-right" style={{ color: G.grey }}>{slot}</td>
                    <td className="py-2 px-3 text-right" style={{ color: G.grey }}>{dispRating(base)}</td>
                    <td className="py-2 px-3 text-right" style={{ color: eraMod >= 0.85 ? '#4ade80' : eraMod >= 0.70 ? '#facc15' : G.red }}>{(eraMod * 100).toFixed(0)}%</td>
                    <td className="py-2 px-3 text-right" style={{ color: fitPenalty === 0 ? G.grey : fitPenalty === 0.10 ? G.grey : G.red }}>
                      {fitPenalty === 0 ? '—' : `-${(fitPenalty * 100).toFixed(0)}%`}
                    </td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: G.gold }}>{dispRating(adjusted)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simulate Season button */}
        {!simStarted && (
          <div className="py-4">
            <div className="flex justify-center gap-3">
              <Btn onClick={startSim} variant="gold" className="px-12 py-4 text-base">
                Simulate Season
              </Btn>
              {isLocalhost && (
                <Btn onClick={() => runBatch(50)} variant="outline" className="px-6 py-4 text-base">
                  Run 50×
                </Btn>
              )}
            </div>

            {batchResults && (() => {
              const avgWins = batchResults.reduce((s, r) => s + r.wins, 0) / batchResults.length
              const minW = Math.min(...batchResults.map(r => r.wins))
              const maxW = Math.max(...batchResults.map(r => r.wins))
              const champCount = batchResults.filter(r => r.champion).length
              const roundLabels = ['First Round Exit', 'Semifinals', 'Conf. Finals', 'Finals L']
              return (
                <div className="mt-4 mx-2" style={{ background: G.surface, border: `1px solid ${G.border}` }}>
                  <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
                    <span className="text-xs uppercase tracking-[0.2em]" style={{ color: G.grey }}>10-Run Batch Results</span>
                    <span className="text-xs" style={{ color: G.gold }}>
                      avg {avgWins.toFixed(1)}W &nbsp;({minW}–{maxW} range) &nbsp;·&nbsp; {champCount}/10 champs
                    </span>
                  </div>
                  <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                        <th className="px-3 py-1.5 text-left" style={{ color: G.grey, fontWeight: 400 }}>#</th>
                        <th className="px-3 py-1.5 text-left" style={{ color: G.grey, fontWeight: 400 }}>Record</th>
                        <th className="px-3 py-1.5 text-left" style={{ color: G.grey, fontWeight: 400 }}>Playoff Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((r, i) => (
                        <tr key={i} style={{ borderBottom: i < batchResults.length - 1 ? `1px solid ${G.border}33` : 'none' }}>
                          <td className="px-3 py-1.5" style={{ color: G.greyDark }}>{i + 1}</td>
                          <td className="px-3 py-1.5" style={{ color: G.white, fontWeight: 500 }}>{r.wins}–{r.losses}</td>
                          <td className="px-3 py-1.5" style={{ color: r.champion ? G.gold : r.roundsWon >= 3 ? '#88BBFF' : G.grey }}>
                            {r.champion ? 'Champion 🏆' : roundLabels[Math.min(r.roundsWon, 3)]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        )}

        {/* Regular season ticker + record */}
        {simStarted && (
          <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>
            <div className="text-center py-8" style={{ borderBottom: `1px solid ${G.border}` }}>
              {done ? (
                <>
                  {sandboxMode && (
                    <div className="text-xs uppercase tracking-[0.25em] mb-3 py-1.5 mx-8" style={{ color: G.gold, background: `${G.gold}18`, border: `1px solid ${G.gold}66`, letterSpacing: '0.25em', fontWeight: 700 }}>
                      Sandbox Mode
                    </div>
                  )}
                  {salaryCapMode && (
                    <div className="text-xs uppercase tracking-[0.25em] mb-3 py-1.5 mx-8" style={{ color: G.gold, background: `${G.gold}18`, border: `1px solid ${G.gold}66`, letterSpacing: '0.25em', fontWeight: 700 }}>
                      Salary Cap Mode
                    </div>
                  )}
                  <div className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: G.grey }}>Regular Season</div>
                  <div style={{ ...BEBAS, fontSize: 'clamp(64px, 14vw, 120px)', lineHeight: 1, color: wins === seasonGames ? G.gold : wins === 0 ? '#CC3333' : G.white, letterSpacing: '0.02em' }}>
                    {wins}–{losses}
                  </div>

                  {wins === seasonGames ? (
                    <div className="mt-4 px-6">
                      <div style={{ background: 'rgba(201,168,76,0.10)', border: `2px solid ${G.gold}`, padding: '14px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 6 }}>
                          <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${G.gold})` }} />
                          <div style={{ ...BEBAS, fontSize: 26, color: G.gold, letterSpacing: '0.3em' }}>PERFECT SEASON</div>
                          <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${G.gold})` }} />
                        </div>
                        <div className="text-xs uppercase tracking-[0.3em] text-center" style={{ color: G.goldDim }}>
                          {seasonGames}–0 - The greatest team ever assembled
                        </div>
                      </div>
                    </div>
                  ) : wins === 0 ? (
                    <div className="mt-4 px-6">
                      <div style={{ background: 'rgba(204,51,51,0.08)', border: `1px solid #CC3333`, padding: '14px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 6 }}>
                          <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, #CC3333)' }} />
                          <div style={{ ...BEBAS, fontSize: 26, color: '#CC3333', letterSpacing: '0.3em' }}>WINLESS SEASON</div>
                          <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, #CC3333)' }} />
                        </div>
                        <div className="text-xs uppercase tracking-[0.3em] text-center" style={{ color: '#774444' }}>
                          0–{seasonGames} - Not a single win all season
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 text-xs uppercase tracking-[0.3em]" style={{ color: G.gold }}>{verdict}</div>
                      <div className="mt-1 text-xs" style={{ color: G.grey }}>
                        {(wins / seasonGames * 100).toFixed(1)}% win rate
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: G.grey }}>Game {games.length} of {seasonGames}</div>
                  <div style={{ ...BEBAS, fontSize: 80, lineHeight: 1, color: G.white }}>
                    {wins}–{losses}
                  </div>
                </>
              )}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-1">
                {games.map((win, i) => (
                  <div key={i} title={`Game ${i + 1}: ${win ? 'W' : 'L'}`}
                    style={{ width: 12, height: 12, background: win ? G.gold : G.greyDark, flexShrink: 0 }} />
                ))}
                {Array.from({ length: seasonGames - games.length }).map((_, i) => (
                  <div key={`e-${i}`} style={{ width: 12, height: 12, background: G.border, flexShrink: 0 }} />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: G.greyDark }}>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, background: G.gold, marginRight: 4 }} />Win</span>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, background: G.greyDark, marginRight: 4 }} />Loss</span>
              </div>
            </div>
          </div>
        )}

        {/* Regular season stats */}
        {done && seasonStats.length > 0 && (
          <StatsTable
            stats={seasonStats}
            simEra={simEra}
            title="Regular Season Stats"
            subtitle={`Era-adjusted, minutes-scaled per-game averages across ${seasonGames} games`}
            teamActualPPG={avgTeamScore ?? undefined}
            teamActualOppPPG={avgOppScore ?? undefined}
            oppStats={seasonOppStats}
            eraFilter={eraFilter}
          />
        )}

        {/* Season awards */}
        {done && seasonStats.length > 0 && (
          <SeasonAwardsPanel awards={seasonAwards} />
        )}

        {/* Missed playoffs */}
        {done && !madePlayoffs && (
          <div className="text-center py-6" style={{ background: G.surface, border: `1px solid ${G.border}` }}>
            <div className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: G.greyDark }}>Missed Playoffs</div>
            <div className="text-sm" style={{ color: G.grey }}>{wins} wins, below the playoff threshold</div>
          </div>
        )}

        {/* Simulate Playoffs button */}
        {done && madePlayoffs && !playoffStarted && (
          <div className="text-center py-4 space-y-3">
            <div style={{ fontSize: 11, color: G.grey, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              First Round - <span style={{ color: G.goldDim }}>{firstRoundLabel(simEra)}</span>
              <span style={{ color: G.border, margin: '0 8px' }}>·</span>
              All Other Rounds - <span style={{ color: G.goldDim }}>Best of 7</span>
            </div>
            <Btn onClick={startPlayoffs} variant="gold" className="px-16 py-4 text-base">
              Simulate Playoffs
            </Btn>
          </div>
        )}

        {/* Playoff — game-by-game reveal */}
        {playoffStarted && (
          <div className="space-y-3">

            {/* Current game spotlight */}
            {currentGame ? (
              <div style={{ background: G.surface, border: `1px solid ${currentGame.win ? G.gold : G.red}` }}>
                {/* Round + game label */}
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <div className="text-xs uppercase tracking-[0.25em]" style={{ color: G.grey }}>
                    {ROUND_NAMES[currentGame.roundIndex]}
                  </div>
                  <div style={{ ...BEBAS, fontSize: 15, color: G.goldDim, letterSpacing: '0.1em' }}>
                    Game {currentGame.gameInSeries}
                  </div>
                </div>

                {/* Score display */}
                <div className="flex items-center justify-center gap-10 py-8">
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: G.grey }}>Your Team</div>
                    <div style={{ ...BEBAS, fontSize: 'clamp(64px, 14vw, 100px)', lineHeight: 1, color: currentGame.win ? G.gold : G.white }}>
                      {currentGame.teamScore}
                    </div>
                  </div>
                  <div style={{ ...BEBAS, fontSize: 22, color: G.greyDark }}>–</div>
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: G.grey }}>Opponent</div>
                    <div style={{ ...BEBAS, fontSize: 'clamp(64px, 14vw, 100px)', lineHeight: 1, color: currentGame.win ? G.greyDark : G.red }}>
                      {currentGame.oppScore}
                    </div>
                  </div>
                </div>

                {/* Game leaders */}
                <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10, paddingBottom: 6 }}>
                  <div className="flex justify-center gap-6 px-5 pb-2">
                    {[
                      { label: 'PTS', leader: currentGame.leaders.pts },
                      { label: 'REB', leader: currentGame.leaders.reb },
                      { label: 'AST', leader: currentGame.leaders.ast },
                    ].map(({ label, leader }) => (
                      <div key={label} className="text-center">
                        <div style={{ fontSize: 11, color: G.white, fontWeight: 600 }}>{leader.name} <span style={{ color: G.gold }}>{leader.val}</span></div>
                        <div style={{ fontSize: 9, color: G.greyDark, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {currentGame.playerLines && currentGame.playerLines.length > 0 && (() => {
                    const roundName = ROUND_NAMES[currentGame.roundIndex]
                    const gameNum = revealedGames.filter(g => g.roundIndex === currentGame.roundIndex).length
                    return (
                      <div className="text-center">
                        <button
                          onClick={() => setSelectedGame({ game: currentGame, roundName, gameNum })}
                          style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: G.greyDark, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = G.gold)}
                          onMouseLeave={e => (e.currentTarget.style.color = G.greyDark)}
                        >
                          Full box score ↗
                        </button>
                      </div>
                    )
                  })()}
                </div>

                {/* Special performance */}
                {currentGame.special && (
                  <div className="text-center px-5 pb-3" style={{ fontSize: 11, color: G.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    ★ {currentGame.special.playerName}: {currentGame.special.label}
                  </div>
                )}

                {/* Result + series record */}
                <div className="flex items-center justify-between px-5 pb-4">
                  <div style={{ ...BEBAS, fontSize: 22, color: currentGame.win ? G.gold : G.red, letterSpacing: '0.1em' }}>
                    {currentGame.win ? 'WIN' : 'LOSS'}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em]" style={{
                    color: seriesW > seriesL ? G.gold : seriesW < seriesL ? G.red : G.grey
                  }}>
                    Series {seriesW}–{seriesL}
                    {seriesOver ? (seriesW === 4 ? ' - Advanced' : ' - Eliminated') : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6" style={{ background: G.surface, border: `1px solid ${G.border}` }}>
                <div className="text-xs uppercase tracking-[0.3em]" style={{ color: G.grey }}>NBA Playoffs</div>
                <div className="text-xs mt-2" style={{ color: G.greyDark }}>Starting...</div>
              </div>
            )}


            {/* Playoff bracket */}
            {liveRounds.some(r => r.rGames.length > 0) && (() => {
              const activeBracketRound = liveRounds.reduce((last, r, i) => r.rGames.length > 0 ? i : last, 0)
              const displayRound = selectedBracketRound ?? activeBracketRound
              const displayData = liveRounds[displayRound]
              const winsTotal = liveRounds.filter(r => r.advanced).length
              const bracketLabel = (name: string) =>
                name === 'Conference Finals' ? 'Conf Finals' : name === 'NBA Finals' ? 'Finals' : name
              return (
                <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>

                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 8px', borderBottom: `1px solid ${G.border}` }}>
                    <div style={{ ...BEBAS, fontSize: 18, letterSpacing: '0.18em', color: G.goldDim }}>NBA Playoffs</div>
                    {winsTotal > 0 && (
                      <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#444' }}>
                        {winsTotal} round{winsTotal !== 1 ? 's' : ''} won
                      </div>
                    )}
                  </div>

                  {/* Bracket cards row — no overflow scroll, compact enough for mobile */}
                  <div style={{ display: 'flex', alignItems: 'stretch', padding: '12px 10px 8px', gap: 0 }}>
                    {liveRounds.map((round, ri) => {
                      const reached = round.rGames.length > 0
                      const won  = round.complete && round.advanced
                      const lost = round.complete && !round.advanced
                      const isActive   = !round.complete && reached
                      const isSelected = ri === displayRound
                      const prevWon    = liveRounds[ri - 1]?.advanced ?? false

                      const accentCol   = won ? G.gold : lost ? G.red : isActive ? '#444' : '#222'
                      const outerBorder = isSelected ? (won ? G.gold : lost ? G.red : G.white) : '#1e1e1e'
                      const labelCol    = won ? G.goldDim : lost ? '#6b2020' : reached ? '#3a3a3a' : '#1c1c1c'
                      const teamCol     = won ? G.gold : reached ? G.white : '#282828'
                      const oppCol      = lost ? G.red : reached ? '#555' : '#1e1e1e'
                      const teamNumCol  = won ? G.gold : reached ? G.white : '#242424'
                      const oppNumCol   = lost ? G.red : reached ? '#666' : '#1e1e1e'
                      const arrowCol    = prevWon ? `${G.goldDim}90` : '#252525'

                      return (
                        <React.Fragment key={round.name}>
                          {/* Arrow connector */}
                          {ri > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 10 }}>
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <path d="M1 7h10M8 3l4 4-4 4" stroke={arrowCol} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}

                          {/* Matchup card */}
                          <div
                            onClick={() => reached && setSelectedBracketRound(prev => prev === ri ? null : ri)}
                            className={reached ? 'bracket-card' : undefined}
                            style={{
                              flex: '1 1 0',
                              minWidth: 0,
                              background: G.black,
                              borderTop: `1px solid ${outerBorder}`,
                              borderRight: `1px solid ${outerBorder}`,
                              borderBottom: `1px solid ${outerBorder}`,
                              borderLeft: `3px solid ${accentCol}`,
                              cursor: reached ? 'pointer' : 'default',
                              opacity: reached ? 1 : 0.15,
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'border-color 0.18s',
                            }}
                          >
                            {/* Round name */}
                            <div style={{
                              fontSize: 7,
                              padding: '5px 7px 4px',
                              borderBottom: '1px solid #111',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                              color: labelCol,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {bracketLabel(round.name)}
                            </div>

                            {/* YOUR TEAM row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 7px 5px' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: teamCol, flex: 1, overflow: 'hidden', textOverflow: 'clip', whiteSpace: 'nowrap' }}>
                                Your Team
                              </div>
                              <div style={{ ...BEBAS, fontSize: 22, lineHeight: 1, color: teamNumCol, marginLeft: 4, flexShrink: 0 }}>
                                {reached ? round.w : '—'}
                              </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: '#111', margin: '0 7px' }} />

                            {/* OPPONENT row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 7px 8px' }}>
                              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.02em', color: oppCol, flex: 1, overflow: 'hidden', textOverflow: 'clip', whiteSpace: 'nowrap' }}>
                                Opponent
                              </div>
                              <div style={{ ...BEBAS, fontSize: 22, lineHeight: 1, color: oppNumCol, marginLeft: 4, flexShrink: 0 }}>
                                {reached ? round.l : '—'}
                              </div>
                            </div>

                            {/* Dots + status */}
                            {reached && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 7px 6px', borderTop: '1px solid #111', gap: 4 }}>
                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                                  {round.rGames.map((g, gi) => (
                                    <div key={gi} style={{ width: 6, height: 6, borderRadius: '50%', background: g.win ? G.gold : G.red, flexShrink: 0 }} />
                                  ))}
                                </div>
                                <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0, color: won ? G.gold : lost ? G.red : '#3a3a3a' }}>
                                  {won ? 'ADV' : lost ? 'OUT' : 'LIVE'}
                                </div>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      )
                    })}
                  </div>

                  {/* Detail panel for selected round */}
                  <div style={{ borderTop: `1px solid ${G.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `1px solid ${G.border}` }}>
                      <div style={{ ...BEBAS, fontSize: 15, letterSpacing: '0.15em', color: displayData.complete ? (displayData.advanced ? G.gold : G.red) : G.white }}>
                        {bracketLabel(displayData.name)}
                      </div>
                      <div style={{ fontSize: 10, letterSpacing: '0.12em', color: displayData.complete ? (displayData.advanced ? G.gold : G.red) : G.grey }}>
                        {displayData.w}–{displayData.l}{displayData.complete ? (displayData.advanced ? ' · ADV' : ' · ELIM') : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
                      {displayData.rGames.map((g, gi) => (
                        <div key={gi}
                          onClick={() => setSelectedGame({ game: g, roundName: displayData.name, gameNum: gi + 1 })}
                          className={`playoff-game-card ${g.win ? 'playoff-game-card--win' : 'playoff-game-card--loss'}`}
                          style={{ flexShrink: 0, width: 104, background: G.black, cursor: 'pointer', overflow: 'hidden', border: `1px solid ${G.border}` }}
                        >
                          <div style={{ height: 3, background: g.win ? G.gold : G.red }} />
                          <div style={{ padding: '7px 9px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                              <div style={{ fontSize: 8, color: '#444', letterSpacing: '0.12em' }}>GAME {gi + 1}</div>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: g.win ? G.gold : G.red }}>{g.win ? 'W' : 'L'}</div>
                            </div>
                            <div style={{ ...BEBAS, fontSize: 18, lineHeight: 1, color: g.win ? G.white : G.grey, letterSpacing: '0.04em', marginBottom: 6 }}>
                              {g.teamScore}–{g.oppScore}
                            </div>
                            <div style={{ fontSize: 9, color: G.gold, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {g.leaders.pts.name.split(' ').slice(-1)[0]} <span style={{ color: G.white, fontWeight: 600 }}>{g.leaders.pts.val}</span>
                            </div>
                            {g.special && (
                              <div style={{ fontSize: 8, color: G.goldDim, marginTop: 3 }}>★ special</div>
                            )}
                            {g.playerLines && g.playerLines.length > 0 && (
                              <div style={{ fontSize: 8, color: '#444', marginTop: 5, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Box score ↗
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )
            })()}

            {/* Playoff controls */}
            {!playoffDone && playoffRevealIndex > 0 && (
              <div className="flex justify-center gap-3">
                {!autoAdvance && (
                  <Btn onClick={nextGame} variant="outline" className="px-8 py-2 text-xs">
                    Next Game
                  </Btn>
                )}
                {!autoAdvance && (
                  <Btn onClick={() => setAutoAdvance(true)} variant="ghost" className="px-8 py-2 text-xs">
                    Auto Advance
                  </Btn>
                )}
                <Btn onClick={skipPlayoffs} variant="ghost" className="px-8 py-2 text-xs">
                  Skip to End
                </Btn>
              </div>
            )}

            {/* Final result banner */}
            {playoffDone && playoffResult?.champion && (
              <div className="text-center py-10 relative overflow-hidden" style={{ background: G.surface, border: `1px solid ${G.gold}` }}>
                <div className="card-sheen-beam" />
                <div style={{ ...BEBAS, fontSize: 'clamp(48px, 10vw, 80px)', lineHeight: 1, color: G.gold, letterSpacing: '0.06em', position: 'relative', zIndex: 1 }}>
                  NBA Champions
                </div>
              </div>
            )}
          </div>
        )}

        {/* Playoff stats */}
        {playoffDone && playoffResult && playoffResult.playoffStats.length > 0 && (
          <StatsTable
            stats={playoffResult.playoffStats}
            simEra={simEra}
            title="Playoff Stats"
            subtitle={`Era-adjusted, minutes-scaled per-game averages - ${playoffResult.allGames.length} games`}
            teamActualPPG={playoffResult.allGames.reduce((sum, g) => sum + g.teamScore, 0) / playoffResult.allGames.length}
            teamActualOppPPG={playoffResult.allGames.reduce((sum, g) => sum + g.oppScore, 0) / playoffResult.allGames.length}
            oppStats={playoffOppStats}
            playoffGames={playoffResult.allGames}
            eraFilter={eraFilter}
          />
        )}

        {/* Finals MVP */}
        {playoffDone && playoffResult?.champion && finalsMVP && (
          <div style={{ background: G.surface, border: `1px solid ${G.gold}` }}>
            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.gold}44` }}>
              <div className="text-sm uppercase tracking-widest font-semibold" style={{ color: G.gold }}>
                Finals MVP
              </div>
            </div>
            <div className="flex items-center gap-5 px-5 py-4">
              <PlayerHeadshot personId={finalsMVP.player.person_id} size={64} initial={finalsMVP.player.full_name[0]} />
              <div>
                <div style={{ ...BEBAS, fontSize: 26, color: G.gold, letterSpacing: '0.05em', lineHeight: 1 }}>
                  {finalsMVP.player.full_name}
                </div>
                <div className="text-xs mt-2 uppercase tracking-widest" style={{ color: G.grey }}>
                  {finalsMVP.PTS.toFixed(1)} PPG
                  <span className="mx-2" style={{ color: G.border }}>·</span>
                  {finalsMVP.REB.toFixed(1)} RPG
                  <span className="mx-2" style={{ color: G.border }}>·</span>
                  {finalsMVP.AST.toFixed(1)} APG
                  <span className="mx-2" style={{ color: G.border }}>·</span>
                  {(calcTS(finalsMVP.player) * 100).toFixed(1)}% TS
                  <span className="mx-2" style={{ color: G.border }}>·</span>
                  Finals ({finalsMVP.GP}G)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Analysis */}
        {allDone && teamAnalysis && (() => {
          const { spacingWinFactor, isPreThreePt, highVolumeShooterCount, rebFactor, blkScore, astFactor } = teamAnalysis
          const spacingPct = (spacingWinFactor - 1) * 100
          const rebPct     = (rebFactor - 1) * 100
          const BLK_BASELINE = 3.5

          type Chip = { label: string; status: 'good' | 'bad' | 'neutral' }
          const chips: Chip[] = []

          // Spacing (not applicable in pre-3pt eras)
          if (!isPreThreePt) {
            chips.push(spacingPct >= 5 ? { label: 'Elite Spacing', status: 'good' }
              : spacingPct >= 0 ? { label: 'Good Spacing', status: 'good' }
              : spacingPct >= -5 ? { label: 'Average Spacing', status: 'neutral' }
              : spacingPct >= -7.5 ? { label: 'Limited Spacing', status: 'bad' }
              : spacingPct >= -10 ? { label: 'Poor Spacing', status: 'bad' }
              : { label: 'No Spacing', status: 'bad' })
          }

          // Rim protection
          chips.push(blkScore >= BLK_BASELINE * 1.5 ? { label: 'Elite Rim Protection', status: 'good' }
            : blkScore >= BLK_BASELINE * 0.9 ? { label: 'Good Rim Protection', status: 'good' }
            : blkScore >= BLK_BASELINE * 0.6 ? { label: 'Average Rim Protection', status: 'neutral' }
            : blkScore >= BLK_BASELINE * 0.35 ? { label: 'Weak Rim Protection', status: 'bad' }
            : { label: 'No Rim Protection', status: 'bad' })

          // Rebounding
          chips.push(rebPct > 5 ? { label: 'Rebounding Edge', status: 'good' }
            : rebPct > 2 ? { label: 'Slight Reb. Edge', status: 'good' }
            : rebPct < -5 ? { label: 'Rebounding Deficit', status: 'bad' }
            : rebPct < -2 ? { label: 'Slight Reb. Deficit', status: 'bad' }
            : { label: 'Average Rebounding', status: 'neutral' })

          // Playmaking
          const astPct = (astFactor - 1) * 100
          chips.push(astPct > 3 ? { label: 'Elite Playmaking', status: 'good' }
            : astPct > 1 ? { label: 'Good Playmaking', status: 'good' }
            : astPct < -3 ? { label: 'Poor Playmaking', status: 'bad' }
            : astPct < -1 ? { label: 'Limited Playmaking', status: 'bad' }
            : { label: 'Average Playmaking', status: 'neutral' })

          const chipColor = { good: '#4ade80', bad: G.red, neutral: G.greyDark }

          return (
            <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
                <div className="text-xs uppercase tracking-widest font-semibold text-white shrink-0">Team Analysis</div>
                {chips.map(chip => (
                  <div key={chip.label} className="text-xs font-semibold uppercase tracking-wide" style={{ color: chipColor[chip.status] }}>
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Share + Play Again — bottom of page, after everything resolves */}
        {allDone && (
          <div className="flex flex-col gap-3">
            <Btn onClick={handleShare} disabled={sharing} variant="outline" className="w-full py-3">
              {sharing ? 'Generating…' : (!sandboxMode && !customEraRange ? 'Share Result / Submit to Leaderboard' : 'Share Result')}
            </Btn>
            <Btn onClick={onRestart} variant="gold" className="w-full py-3">
              Play Again
            </Btn>
          </div>
        )}

      </div>

      {/* Hidden 1080×1080 result card rendered for html2canvas capture */}
      {done && seasonStats.length > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: '-1100px',
            left: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <ResultCard
            ref={cardRef}
            simEra={simEra}
            wins={wins}
            losses={losses}
            seasonStats={seasonStats}
            coach={coach}
            teamRating={tr}
            headshots={headshots}
            sandboxMode={sandboxMode}
            salaryCapMode={salaryCapMode}
            playoffOutcome={
              madePlayoffs && playoffDone && playoffResult
                ? {
                    champion: playoffResult.champion,
                    eliminatedIn: !playoffResult.champion
                      ? playoffResult.rounds.at(-1)?.name
                      : undefined,
                  }
                : null
            }
            playerAwards={seasonAwards.reduce<Record<string, string[]>>((acc, a) => {
              const id = a.player.player.person_id
              if (!acc[id]) acc[id] = []
              const short =
                a.award === 'League MVP'         ? 'MVP' :
                a.award.startsWith('All-NBA')    ? 'ALL-NBA' :
                a.award === 'All-Star'            ? 'ALL-STAR' :
                a.award === 'Defensive POY'       ? 'DPOY' :
                a.award === '6th Man of the Year' ? '6MOY' : a.award
              if (!acc[id].includes(short)) acc[id].push(short)
              return acc
            }, {})}
            finalsMVPId={finalsMVP?.player.person_id ?? null}
            finalsMVPStats={finalsMVP ?? null}
            customEraRange={customEraRange ?? null}
          />
        </div>
      )}

      {/* Game detail popup */}
      {selectedGame && typeof document !== 'undefined' && (() => {
        const { game: g, roundName, gameNum } = selectedGame
        return createPortal(
          <div onClick={() => setSelectedGame(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: G.surface, border: `1px solid ${g.win ? G.goldDim : G.border}`, width: 'min(560px, 95vw)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', overflowX: 'hidden', filter: eraFilter }}>
              {/* Win/loss bar */}
              <div style={{ height: 4, background: g.win ? G.gold : G.red }} />
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${G.border}` }}>
                <div style={{ fontSize: 10, color: G.grey, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{roundName}</div>
                <div style={{ ...BEBAS, fontSize: 14, color: G.goldDim, letterSpacing: '0.1em' }}>Game {gameNum}</div>
              </div>
              {/* Score */}
              <div style={{ textAlign: 'center', padding: '18px 16px 12px' }}>
                <div style={{ fontSize: 9, color: G.grey, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6 }}>
                  {g.win ? 'WIN' : 'LOSS'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <span style={{ ...BEBAS, fontSize: 52, color: g.win ? G.white : G.grey, lineHeight: 1 }}>{g.teamScore}</span>
                  <span style={{ ...BEBAS, fontSize: 24, color: G.greyDark }}>–</span>
                  <span style={{ ...BEBAS, fontSize: 52, color: G.greyDark, lineHeight: 1 }}>{g.oppScore}</span>
                </div>
                <div style={{ fontSize: 9, color: G.greyDark, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Your Team -Opponent</div>
              </div>
              {/* Box score */}
              {g.playerLines && g.playerLines.length > 0 && (
                <div style={{ borderTop: `1px solid ${G.border}`, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                        <th style={{ padding: '5px 8px', textAlign: 'left', color: G.grey, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Player</th>
                        {['MIN','PTS','REB','AST','STL','BLK','TOV','FG%','3P%','FT%'].map(h => (
                          <th key={h} style={{ padding: '5px 6px', textAlign: 'center', color: G.grey, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {g.playerLines.map((line, i) => {
                        const lastName = line.name.split(' ').slice(-1)[0]
                        const isBench = line.slot.startsWith('B')
                        const isPtsLeader = line.pts === g.leaders.pts.val
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${G.borderSub}`, background: i % 2 === 0 ? 'transparent' : `${G.white}04` }}>
                            <td style={{ padding: '5px 8px', color: isBench ? G.grey : G.white, whiteSpace: 'nowrap' }}>{lastName}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{line.mpg}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: isPtsLeader ? G.gold : G.white, fontWeight: isPtsLeader ? 700 : 400 }}>{line.pts}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: line.reb === g.leaders.reb.val ? G.gold : G.white }}>{line.reb}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: line.ast === g.leaders.ast.val ? G.gold : G.white }}>{line.ast}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{Math.round(line.stl)}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{Math.round(line.blk)}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{Math.round(line.tov)}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{(line.fg * 100).toFixed(1)}%</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{line.fg3 != null ? `${(line.fg3 * 100).toFixed(1)}%` : '—'}</td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', color: G.greyDark }}>{(line.ft * 100).toFixed(1)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Special performance */}
              {g.special && (
                <div style={{ borderTop: `1px solid ${G.border}`, padding: '10px 16px', background: `${G.gold}0A` }}>
                  <div style={{ fontSize: 8, color: G.goldDim, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>★ Special Performance</div>
                  <div style={{ fontSize: 13, color: G.gold, fontWeight: 700 }}>{g.special.playerName}</div>
                  <div style={{ fontSize: 10, color: G.grey, marginTop: 2 }}>
                    {g.special.pts} PTS -{g.special.reb} REB -{g.special.ast} AST
                  </div>
                  <div style={{ fontSize: 9, color: G.goldDim, marginTop: 3, fontStyle: 'italic' }}>{g.special.label}</div>
                </div>
              )}
              {/* Close */}
              <div style={{ borderTop: `1px solid ${G.border}`, padding: '8px 16px', textAlign: 'center' }}>
                <button onClick={() => setSelectedGame(null)} className="modal-close" style={{ fontSize: 10, color: G.grey, textTransform: 'uppercase', letterSpacing: '0.2em', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        , document.body)
      })()}

      {/* Share card modal */}
      {shareImageUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '60px 24px 40px',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShareImageUrl(null); setShareHint(null) } }}
        >
          {/* Close button */}
          <button
            onClick={() => { setShareImageUrl(null); setShareHint(null) }}
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              background: 'transparent',
              border: `1px solid ${G.border}`,
              color: G.grey,
              fontSize: 20,
              lineHeight: 1,
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>

          {/* Card preview */}
          <img
            src={shareImageUrl}
            alt="Era Ball result card"
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              objectFit: 'contain',
              border: `1px solid ${G.border}`,
            }}
          />

          {/* Action buttons */}
          {/* Leaderboard submission */}
          {sandboxMode || customEraRange ? (
            <div style={{ width: '100%', maxWidth: 400, marginTop: 20, padding: '12px 16px', border: `1px solid ${G.border}`, background: G.surface, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.08em' }}>
                {sandboxMode ? 'Sandbox mode is not eligible for the leaderboard.' : 'Custom era range is not eligible for the leaderboard.'}
              </div>
            </div>
          ) : (
          <div style={{ width: '100%', maxWidth: 400, marginTop: 20, padding: '16px', border: `1px solid ${G.border}`, background: G.surface }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: G.gold, marginBottom: 10, textAlign: 'center' }}>
              Submit to Leaderboard
            </div>
            {lbSubmitted ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: G.white, marginBottom: 4 }}>Score submitted!</div>
                <div style={{ ...BEBAS, fontSize: 36, color: G.gold, lineHeight: 1 }}>{Math.round(lbScore ?? 0).toLocaleString()}</div>
                <div style={{ fontSize: 10, color: G.greyDark, marginTop: 4, letterSpacing: '0.1em' }}>
                  {simEra?.toUpperCase()} · {salaryCapMode ? 'SALARY CAP' : 'NORMAL'}
                </div>
                <div style={{ fontSize: 12, color: G.grey, marginTop: 6, letterSpacing: '0.06em' }}>
                  {lbRank != null ? `Rank #${lbRank.toLocaleString()}` : 'Fetching rank...'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={lbTeamNameRef}
                  type="text"
                  placeholder="Your team name..."
                  maxLength={30}
                  onKeyDown={e => e.key === 'Enter' && handleLeaderboardSubmit()}
                  style={{ flex: 1, background: G.black, border: `1px solid ${G.border}`, color: G.white, padding: '8px 10px', fontSize: 13, outline: 'none', minWidth: 0 }}
                />
                <Btn onClick={handleLeaderboardSubmit} variant="gold" style={{ flexShrink: 0 }} disabled={lbSubmitting}>
                  {lbSubmitting ? '...' : 'Submit'}
                </Btn>
              </div>
            )}
            {lbError && <div style={{ fontSize: 11, color: '#CC4444', marginTop: 6, letterSpacing: '0.04em' }}>{lbError}</div>}
          </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, width: '100%', maxWidth: 400 }}>
            <Btn onClick={handleShareTwitter} variant="ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </Btn>
            {shareHint && (
              <div style={{ textAlign: 'center', fontSize: 11, color: G.gold, letterSpacing: '0.04em', padding: '2px 0' }}>
                {shareHint}
              </div>
            )}
            <Btn onClick={handleShareWhatsApp} variant="ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Text / WhatsApp
            </Btn>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={handleDownload} variant="gold" style={{ flex: 1 }}>Download Image</Btn>
              <Btn onClick={() => { setShareImageUrl(null); setShareHint(null) }} variant="ghost" style={{ flex: 1 }}>Close</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ─── Era audio map ────────────────────────────────────────────────────────────
const _audioElements = new Map<string, HTMLAudioElement>()

const WORKER_BASE = 'https://assets.eraball.com'

function getAudioElement(src: string): HTMLAudioElement {
  if (!_audioElements.has(src)) {
    const el = new Audio(src)
    el.loop = true
    el.preload = 'none'
    el.addEventListener('error', () => {
      if (!el.src.includes('assets.eraball.com')) {
        const wasPlaying = !el.paused
        el.src = src.replace(R2, WORKER_BASE)
        el.load()
        if (wasPlaying) el.play().catch(() => {})
      }
    }, { once: true })
    _audioElements.set(src, el)
  }
  return _audioElements.get(src)!
}

const R2 = 'https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev'

const ERA_AUDIO: Partial<Record<Era, string>> = {
  '50s': `${R2}/50s.mp3`,
  '60s': `${R2}/60s.mp3`,
  '70s': `${R2}/70s.mp3`,
  '80s': `${R2}/80s.mp3`,
  '90s': `${R2}/90s.mp3`,
  '00s': `${R2}/2000s.mp3`,
  '10s': `${R2}/2010s.mp3`,
  '20s': `${R2}/2020s.mp3`,
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState<GamePhase>('era-select')
  const [simEra, setSimEra] = useState<Era>('20s')
  const [startSandbox, setStartSandbox] = useState(false)
  const [draftWasSandbox, setDraftWasSandbox] = useState(false)
  const [salaryCapMode, setSalaryCapMode] = useState(false)
  const [greyscale, setGreyscale] = useState(false)
  const [hasUsedTheme, setHasUsedTheme] = useState(false)
  const [lowPerfMode, setLowPerfMode] = useState(false)
  const [showPerfDisclaimer, setShowPerfDisclaimer] = useState(false)
  const perfMeasuredRef = React.useRef(false)
  const perfDisclaimerTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [slots, setSlots] = useState<CourtSlot[]>(emptySlots())
  const [coach, setCoach] = useState<Coach | null>(null)
  const [draftCustomEras, setDraftCustomEras] = useState<Era[] | null>(null)
  const [showLifetimeStats, setShowLifetimeStats] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSupporters, setShowSupporters] = useState(false)
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.21)
  // Read saved audio prefs after mount (not in the useState initializer) so server
  // and client render identically — reading localStorage during render breaks hydration.
  useEffect(() => {
    try {
      setMuted(localStorage.getItem('eb-muted') === 'true')
      const v = parseFloat(localStorage.getItem('eb-volume') ?? '')
      if (!isNaN(v)) setVolume(v)
      if (localStorage.getItem('eb-theme-used') === '1') setHasUsedTheme(true)
      if (localStorage.getItem('eb-theme') === 'on') setGreyscale(true)
    } catch {}
  }, [])
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  useEffect(() => {
    setIsMobileDevice('ontouchstart' in window || /Mobi|Android/i.test(navigator.userAgent))
  }, [])
  const [showVolumePopover, setShowVolumePopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 50, right: 16 })
  const volumeBtnRef = useRef<HTMLButtonElement | null>(null)
  const [audioEra, setAudioEra] = useState<Era | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Start / swap music whenever the active era changes
  useEffect(() => {
    if (!audioEra) return
    const src = ERA_AUDIO[audioEra]
    if (!src) return
    if (audioRef.current && audioRef.current !== getAudioElement(src)) audioRef.current.pause()
    const audio = getAudioElement(src)
    try { audio.volume = Math.pow(volume, 2) } catch (_) {}
    audioRef.current = audio
    if (!muted) audio.play().catch(() => {})
    return () => { audio.pause() }
  }, [audioEra])

  // Sync volume + muted to audio element — square for perceptual loudness curve
  // iOS ignores .volume (read-only), so pause/resume for mute instead
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    try { audio.volume = Math.pow(volume, 2) } catch (_) {}
    if (muted) { audio.pause() }
    else if (audio.paused) { audio.play().catch(() => {}) }
    try { localStorage.setItem('eb-muted', String(muted)); localStorage.setItem('eb-volume', String(volume)) } catch {}
  }, [muted, volume])


  // Lazy data load: only fetch the (multi-MB) player dataset once the user actually
  // starts — keeps bandwidth off the flood of visitors who bounce on the landing screen.
  const dataReqRef = useRef(false)
  const ensureData = useCallback(() => {
    if (dataReqRef.current) return
    dataReqRef.current = true
    setLoading(true)
    loadGameData()
      .then(({ players: p, coaches: c }) => { setPlayers(p); setCoaches(c); setLoading(false) })
      .catch(err => { console.error('Failed to load data:', err); setLoading(false); dataReqRef.current = false })
  }, [])


  // FPS check — must be before early return to keep hook order stable
  useEffect(() => {
    const era = audioEra ?? simEra
    const grainEras: Era[] = ['50s', '60s', '70s', '80s', '90s', '00s', '10s']
    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || /Mobi|Android/i.test(navigator.userAgent))
    if (isMobile || perfMeasuredRef.current || !greyscale || !grainEras.includes(era)) return
    let frames = 0, start: number | null = null, animId: number
    const measure = (now: number) => {
      if (!start) start = now
      frames++
      if (now - start < 3000) { animId = requestAnimationFrame(measure); return }
      perfMeasuredRef.current = true
      const fps = frames / ((now - start) / 1000)
      if (fps < 25) {
        setLowPerfMode(true)
        setShowPerfDisclaimer(true)
      }
    }
    animId = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(animId)
  }, [greyscale, audioEra, simEra])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: G.black }}>
        <div className="text-center">
          <div style={{ ...BEBAS, fontSize: 48, color: G.gold, letterSpacing: '0.3em' }} className="animate-pulse">
            ERA BALL
          </div>
          <div className="text-xs uppercase tracking-widest mt-3" style={{ color: G.greyDark }}>Loading...</div>
        </div>
      </div>
    )
  }

  const restart = () => {
    window.location.href = '/'
  }

  const CRT_ERAS: Era[] = ['50s', '60s', '70s', '80s', '90s']
  const effectiveEra: Era = audioEra ?? simEra

  const greyscaleBtn = (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          if (!hasUsedTheme) {
            setHasUsedTheme(true)
            try { localStorage.setItem('eb-theme-used', '1') } catch {}
          }
          if (lowPerfMode && !greyscale) {
            setShowPerfDisclaimer(true)
          }
          setGreyscale(g => {
            try { localStorage.setItem('eb-theme', g ? 'off' : 'on') } catch {}
            return !g
          })
        }}
        className="flex items-center gap-1 text-xs uppercase tracking-widest px-2 py-1"
        style={{
          background: 'transparent',
          color: greyscale ? G.white : G.greyDark,
          border: `1px solid ${greyscale ? G.grey : G.border}`,
          cursor: 'pointer',
          letterSpacing: '0.15em',
          transition: 'all 0.15s ease',
        }}
        title="Toggle era theme"
      >
        <span className="hidden sm:inline">Era </span>Theme
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          color: greyscale ? G.black : G.greyDark,
          background: greyscale ? G.white : G.border,
          padding: '1px 4px',
          borderRadius: 2,
          transition: 'all 0.15s ease',
        }}>{greyscale ? 'ON' : 'OFF'}</span>
      </button>
      {!hasUsedTheme && (
        <div className="era-theme-prompt">
          <div className="era-theme-prompt-arrow" />
          <div className="era-theme-prompt-text">Try Era Themes!</div>
        </div>
      )}
    </div>
  )

  const eraFilter = greyscale ? (
    effectiveEra === '50s' ? 'grayscale(1)' :
    effectiveEra === '60s' ? 'saturate(0.82)' :
    effectiveEra === '70s' ? 'saturate(0.88) contrast(0.94) brightness(0.97)' :
    effectiveEra === '10s' ? 'saturate(1.15) contrast(1.06) brightness(1.02)' :
    'none'
  ) : 'none'

  const isSilent = muted || volume === 0
  const muteBtn = audioEra !== null ? (
    <button
      ref={volumeBtnRef}
      onClick={() => {
        if (isMobileDevice) { setMuted(m => !m); return }
        if (!showVolumePopover && volumeBtnRef.current) {
          const r = volumeBtnRef.current.getBoundingClientRect()
          setPopoverPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
        }
        setShowVolumePopover(s => !s)
      }}
      title="Volume"
      style={{
        background: 'none', border: `1px solid ${isSilent ? G.border : G.goldDim}`,
        color: isSilent ? G.grey : G.gold,
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = G.grey; e.currentTarget.style.color = G.white }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = isSilent ? G.border : G.goldDim; e.currentTarget.style.color = isSilent ? G.grey : G.gold }}
    >
      {isSilent ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
          <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      )}
    </button>
  ) : null

  return (
    <div style={{ filter: eraFilter, minHeight: '100vh' }}>
      {typeof document !== 'undefined' && createPortal(
        <>
          {greyscale && CRT_ERAS.includes(effectiveEra) && (
            <>
              <style>{`
                @keyframes crt-flicker {
                  0%, 18%, 22%, 57%, 100% { opacity: 1; }
                  20% { opacity: 0.94; }
                  59% { opacity: 0.97; }
                }
                @keyframes crt-scan {
                  from { transform: translateY(-80px); }
                  to   { transform: translateY(100vh); }
                }
              `}</style>
              {/* Scanlines */}
              <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10000,
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
                animation: 'crt-flicker 5s infinite',
              }} />
              {/* Vignette */}
              <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10001,
                background: 'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.55) 100%)',
              }} />
              {/* Scan bar — 50s/60s tube TV only */}
              {(effectiveEra === '50s' || effectiveEra === '60s') && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, height: 80,
                  pointerEvents: 'none', zIndex: 10002, willChange: 'transform',
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.03) 50%, transparent)',
                  animation: 'crt-scan 3s linear infinite',
                }} />
              )}
            </>
          )}
          {/* 60s — warm yellow tint */}
          {greyscale && effectiveEra === '60s' && (
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10003, background: 'rgba(255, 220, 80, 0.05)' }} />
          )}
          {/* 50s–90s — film/VHS grain (50s gets higher opacity instead of a second layer) */}
          {!lowPerfMode && greyscale && CRT_ERAS.includes(effectiveEra) && (
            <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10004, mixBlendMode: 'screen' }}>
              <filter id="grain-crt">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch">
                  <animate attributeName="seed" values="3;19;37;52;11;44;28;67;8;41;74;16" dur="1s" calcMode="discrete" repeatCount="indefinite"/>
                </feTurbulence>
              </filter>
              <rect width="100%" height="100%" filter="url(#grain-crt)" opacity={effectiveEra === '50s' ? 0.19 : 0.09}/>
            </svg>
          )}
          {/* 2000s — animated film grain + warm amber tint */}
          {!lowPerfMode && greyscale && effectiveEra === '00s' && (
            <>
              <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000, mixBlendMode: 'screen' }}>
                <filter id="grain-00s">
                  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch">
                    <animate attributeName="seed" values="0;17;42;8;63;29;71;5;88;34;15;56" dur="1s" calcMode="discrete" repeatCount="indefinite"/>
                  </feTurbulence>
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-00s)" opacity="0.15"/>
              </svg>
              <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10001, background: 'rgba(255, 175, 70, 0.01)' }} />
              <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10002, background: 'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.55) 100%)' }} />
            </>
          )}
          {/* 2010s — minor film grain + warm golden tint */}
          {!lowPerfMode && greyscale && effectiveEra === '10s' && (
            <>
              <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000, mixBlendMode: 'screen' }}>
                <filter id="grain-10s">
                  <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch">
                    <animate attributeName="seed" values="5;22;38;14;59;31;68;3;47;76;19;53" dur="1s" calcMode="discrete" repeatCount="indefinite"/>
                  </feTurbulence>
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-10s)" opacity="0.10"/>
              </svg>
              <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10001, background: 'rgba(255, 200, 90, 0.03)' }} />
            </>
          )}
          {/* Low perf disclaimer */}
          {showPerfDisclaimer && (
            <div style={{
              position: 'fixed', top: 52, left: '50%', transform: 'translateX(-50%)',
              zIndex: 10010, background: G.surface2, border: `1px solid ${G.gold}`,
              padding: '8px 14px', maxWidth: 280, display: 'flex', alignItems: 'flex-start', gap: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}>
              <span style={{ fontSize: 11, color: G.greyDark, lineHeight: 1.5, flex: 1 }}>
                Your device can't run all era effects at full quality. Grain has been disabled automatically. Other effects remain on. On desktop, try enabling hardware acceleration in your browser settings.
              </span>
              <button
                onClick={() => setShowPerfDisclaimer(false)}
                style={{ background: 'none', border: 'none', color: G.greyDark, cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0, padding: 0 }}
              >✕</button>
            </div>
          )}
        </>,
        document.body
      )}
      {phase === 'era-select' && <EraSelection onEraSelected={era => { setSimEra(era); setStartSandbox(false); setSalaryCapMode(false); setShowPerfDisclaimer(false); ensureData(); setPhase('draft') }} onSandboxSelected={era => { setSimEra(era); setStartSandbox(true); setSalaryCapMode(false); setShowPerfDisclaimer(false); ensureData(); setPhase('draft') }} onSalaryCapSelected={era => { setSimEra(era); setStartSandbox(false); setSalaryCapMode(true); setShowPerfDisclaimer(false); ensureData(); setPhase('draft') }} onRestart={restart} onLifetimeStats={() => setShowLifetimeStats(true)} onLeaderboard={() => setShowLeaderboard(true)} onAchievements={() => setShowAchievements(true)} onEraPreview={era => setAudioEra(era)} muteBtn={muteBtn} eraThemeBtn={greyscaleBtn} />}
      {showLifetimeStats && <LifetimeStatsModal onClose={() => setShowLifetimeStats(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
      {showSupporters && <SupportersModal onClose={() => setShowSupporters(false)} />}

      {/* Achievement unlock toast */}
      {unlockedAchievements.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {unlockedAchievements.map(a => (
            <div key={a.id} style={{ background: '#0d0d0d', border: `1px solid ${G.gold}`, padding: '12px 16px', minWidth: 240, maxWidth: 320, boxShadow: `0 4px 24px ${G.gold}33` }}>
              <div style={{ fontSize: 9, color: G.gold, letterSpacing: '0.2em', marginBottom: 4 }}>ACHIEVEMENT UNLOCKED</div>
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 18, color: '#fff', letterSpacing: '0.08em' }}>{a.title}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{a.description}</div>
              <button onClick={() => setUnlockedAchievements(prev => prev.filter(x => x.id !== a.id))} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {phase === 'draft' && <DraftScreen simEra={simEra} players={players} onDraftComplete={(s, ce, wasSandbox) => { setSlots(s); setDraftCustomEras(ce); setDraftWasSandbox(wasSandbox); setPhase('coach-draft') }} onRestart={restart} startInSandbox={startSandbox} salaryCapMode={salaryCapMode} greyscaleBtn={greyscaleBtn} muteBtn={muteBtn} themeFilter={eraFilter} />}
      {phase === 'coach-draft' && <CoachDraftScreen coaches={coaches} onCoachSelected={c => { setCoach(c); setPhase('simulation') }} onRestart={restart} sandboxMode={draftWasSandbox} salaryCapMode={salaryCapMode} greyscaleBtn={greyscaleBtn} muteBtn={muteBtn} />}
      {phase === 'simulation' && coach && <SimulationScreen slots={slots} coach={coach} simEra={simEra} onRestart={restart} greyscaleBtn={greyscaleBtn} muteBtn={muteBtn} sandboxMode={draftWasSandbox} salaryCapMode={salaryCapMode} customEraRange={draftCustomEras} eraFilter={eraFilter} onAchievementsUnlocked={setUnlockedAchievements} />}

      {/* Volume popover */}
      {showVolumePopover && audioEra !== null && !isMobileDevice && (
        <>
          <style>{`
            .vol-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;border-radius:2px;outline:none;cursor:pointer;touch-action:none;background:linear-gradient(to right,#C9A84C 0%,#C9A84C var(--vol,35%),#333 var(--vol,35%),#333 100%)}
            .vol-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#C9A84C;cursor:pointer}
            .vol-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#C9A84C;cursor:pointer;border:none}
          `}</style>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9994 }} onClick={() => setShowVolumePopover(false)} />
          <div
            style={{
              position: 'fixed', top: popoverPos.top, right: popoverPos.right, zIndex: 9995,
              background: G.surface2, border: `1px solid ${G.border}`,
              padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160,
            }}
            onTouchMove={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setMuted(m => !m)}
                style={{ background: 'none', border: 'none', color: isSilent ? G.grey : G.gold, cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
              >
                {isSilent ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
                    <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  </svg>
                )}
              </button>
              <input
                type="range"
                className="vol-slider"
                min="0" max="1" step="0.01"
                value={muted ? 0 : volume}
                style={{ '--vol': `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  if (v === 0) { setMuted(true) }
                  else { setVolume(v); if (muted) setMuted(false) }
                }}
              />
            </div>
            <button
              onClick={() => setMuted(m => !m)}
              style={{
                background: 'none', border: `1px solid ${isSilent ? G.grey : G.gold}`,
                color: isSilent ? G.grey : G.gold, cursor: 'pointer',
                fontSize: 10, letterSpacing: '0.12em', padding: '4px 0', width: '100%',
              }}
            >
              {isSilent ? 'UNMUTE' : 'MUTE'}
            </button>
          </div>
        </>
      )}
      {/* Bottom-right footer links */}
      <div className="footer-links-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 20px 32px' }}>
        <span className="footer-links-label" style={{ fontSize: 10, color: G.greyDark, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 2 }}>
          Suggestions or Bugs? Join the Discord or DM me on Twitter:
        </span>
        <div className="footer-links-social">
          <FooterLink href="https://discord.gg/gFAp5adX" label="Discord" color={G.greyDark} border={G.border} opacity={0.7} />
          <FooterLink href="https://x.com/Eshan_Design" label="Twitter" color={G.greyDark} border={G.border} opacity={0.7} />
        </div>
        <FooterLink href="https://ko-fi.com/eshanb" label="Support the game" color={G.gold} border={G.goldDim} opacity={0.85} />
        <FooterButton label="★ Thank you, supporters!" onClick={() => setShowSupporters(true)} />
        <FooterLink href="https://eshanbhattdesign.com" label="eshanbhattdesign.com" color={G.greyDark} border={G.border} opacity={0.7} />
      </div>

      {/* Disclaimer */}
      <div style={{ textAlign: 'center', padding: '12px 24px 28px', maxWidth: 640, margin: '0 auto' }}>
        <p style={{ fontSize: 10, color: G.greyDark, opacity: 0.5, letterSpacing: '0.04em', lineHeight: 1.6, margin: 0 }}>
          EraBall is an unofficial fan project and is not affiliated with, endorsed by, or licensed by the NBA or any of its teams. Player names and statistics are historical public record used for informational and entertainment purposes only.
        </p>
      </div>

    </div>
  )
}
