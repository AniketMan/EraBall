'use client'
// app/_shared/PlayerCard.tsx
// Shared view atom: the full draft-pool player card (stats, tier styling, trait tags).
// Used by the Draft screen and era-preview overlays. Pure presentational - all data
// arrives via the `player` prop; engine helpers are used only for derived display values.

import React from 'react'
import type { Player, Era } from '@eraball/engine'
import { calcTS, playerBaseRating } from '@eraball/engine'
import { G, BEBAS } from '../../src/components/tokens'
import { tierBg, fiftiesTierBorder, eraLabel, playerTeamForEra } from '../../src/lib/ui'
import { PlayerHeadshot, TagTooltip } from '../../src/components'

export function PlayerCard({ player, onDragStart, displayEra, activeEra, devMode, fifties, duoActiveCount }: { player: Player; onDragStart?: () => void; displayEra?: Era; activeEra?: Era; devMode?: boolean; fifties?: boolean; duoActiveCount?: number }) {
  const ts = (calcTS(player) * 100).toFixed(1)
  const imp = (stat: string) => player.imputed_stats?.includes(stat) ?? false
  const fmt = (stat: string, val: string | null | undefined) =>
    val == null ? '—' : imp(stat) ? `~${val}` : val
  const r = playerBaseRating(player, player.era as Era)
  const isSTier = r >= 55
  const isATier = r >= 46 && r < 54
  const sec     = fifties ? '#e2e2e2' : G.grey
  const secDark = fifties ? '#c8c8c8' : G.greyDark
  const tierLabel = r >= 55 ? 'S' : r >= 46 ? 'A' : r >= 38 ? 'B' : r >= 31 ? 'C' : r >= 24 ? 'D' : r >= 16 ? 'E' : 'F'
  const isSixthMan = !!player.sixthMan
  // Some players appear in multiple eras under the same name but represent different
  // people (e.g. Patrick Ewing Sr. vs Jr.). Override the display name by name:era key.
  const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
    'Patrick Ewing:10s': 'Patrick Ewing Jr.',
  }
  const displayName = DISPLAY_NAME_OVERRIDES[`${player.full_name}:${player.era}`] ?? player.full_name
  const tagCount = [
    player.greatest_75_flag === 'Y',
    (player.rings ?? 0) > 0,
    !!player.defAnchor,
    !!player.offAnchor,
    !!player.floorGeneral,
    !!player.shootingStar,
    !!player.glassClean,
    !!player.timeless,
    !!player.duoPartners,
    !!player.flexPositions,
    isSixthMan,
  ].filter(Boolean).length
  const usePillLayout = tagCount > 4

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      className={`select-none transition-all ${onDragStart ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      style={{ position: 'relative', overflow: 'hidden', background: tierBg(player, fifties), border: `1px solid ${fifties ? fiftiesTierBorder(player) : G.border}`, padding: '16px' }}
    >
      {fifties && (
        <div style={{ position: 'absolute', top: 6, right: 9, ...BEBAS, fontSize: 20, letterSpacing: '0.1em', color: '#c8c8d2', lineHeight: 1, zIndex: 2, pointerEvents: 'none' }}>
          {tierLabel}
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <PlayerHeadshot personId={player.person_id} size={80} initial={player.position?.[0]} />
        <div className="flex-1 flex items-start justify-between min-w-0">
          <div className="min-w-0">
            <div className="font-bold text-white text-base leading-tight truncate">{displayName}</div>
            <div className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: sec }}>
              {player.position} - {eraLabel(player.era)} - {player.eraTeam ?? (displayEra ? playerTeamForEra(player, displayEra) : player.team_abbreviation)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
            {!usePillLayout && player.greatest_75_flag === 'Y' && (
              <TagTooltip tip="Recognized as one of the 75 greatest NBA players of all time, a small boost in every game play play.">
                <span className="text-xs uppercase tracking-wide inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: G.gold }}>
                  75 Greatest
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && (player.rings ?? 0) > 0 && (
              <TagTooltip tip="Champions perform better in the playoffs. The more championships, the better the playoff performer.">
                <span className="text-xs uppercase tracking-wide inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: G.gold, letterSpacing: '0.08em' }}>
                  {player.rings}× Champion
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.defAnchor && (
              <TagTooltip tip={(player.anchorTier ?? 1) === 1 ? "Elite defensive anchor. Defensive impact beyond the stat sheet. T1 carries a larger boost than T2." : "Solid defensive anchor. Defensive impact beyond the stat sheet. T1 carries a larger boost than T2."}>
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#4A9ECC' }}>
                  Defensive Anchor <span style={{ opacity: 0.7 }}>T{player.anchorTier ?? 1}</span>
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.offAnchor && (
              <TagTooltip tip={(player.anchorTier ?? 1) === 1 ? "Elite offensive engine. Major boost to team scoring and ball movement." : "Strong offensive contributor. Elevates the team's offense. T1 anchors carry a larger boost."}>
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: G.gold }}>
                  Offensive Anchor <span style={{ opacity: 0.7 }}>T{player.anchorTier ?? 1}</span>
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.floorGeneral && (
              <TagTooltip tip={(player.floorGeneralTier ?? 1) === 1 ? "Elite playmaker. Elevates team ball movement and shot quality. Boosts win probability through playmaking." : "Strong playmaker. Elevates team ball movement. Boosts win probability through playmaking."}>
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#E0D4FF' }}>
                  Floor General <span style={{ opacity: 0.7 }}>T{player.floorGeneralTier ?? 1}</span>
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.shootingStar && (
              <TagTooltip tip={(player.shootingStarTier ?? 1) === 1 ? "Boosts team spacing. Elite all-time shooter. T1 carries a larger boost than T2." : "Boosts team spacing. Special shooter. T1 carries a larger boost than T2."}>
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#F472B6' }}>
                  Shooting Star <span style={{ opacity: 0.7 }}>T{player.shootingStarTier ?? 1}</span>
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.glassClean && (
              <TagTooltip tip="Elite rebounder. Crashes the boards on both ends, boosting team second-chance points and limiting opponent possessions.">
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#34D399' }}>
                  Glass Cleaner
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.timeless && (
              <TagTooltip tip={(player.timelessTier ?? 1) === 1 ? "Transcendent skill set. Minimal era penalties across all decades. Minor penalty only if 6+ eras from home era." : "Highly adaptable skill set. Takes half the normal era penalty across all decades."}>
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#C084FC' }}>
                  Timeless {(player.timelessTier ?? 1) === 2 && <span style={{ opacity: 0.7 }}>T2</span>}
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.duoPartners && (
              <TagTooltip tip={(duoActiveCount ?? 0) > 0 ? `Dynamic Duo active. +${(duoActiveCount ?? 0) * 5} rating boost.` : `Draft ${player.duoPartners.join(' or ')} to activate the Dynamic Duo bonus (+5 per partner).`}>
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: (duoActiveCount ?? 0) > 0 ? '#4ECDC4' : '#666666', letterSpacing: '0.08em', border: `1px solid ${(duoActiveCount ?? 0) > 0 ? '#4ECDC4' : '#4ECDC466'}`, padding: '1px 5px' }}>
                  Dynamic Duo
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && player.flexPositions && (
              <TagTooltip tip="Can play multiple positions outside of their natural position, without penalty..">
                <span className="text-xs px-1.5 py-0.5 uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#4A9ECC', border: `1px solid #2A6E99`, background: `#4A9ECC18` }}>
                  FLEX
                </span>
              </TagTooltip>
            )}
            {!usePillLayout && isSixthMan && (
              <TagTooltip tip="Sixth Man. Elite bench performer. Gets a +6 rating boost when playing off the bench.">
                <span className="text-xs uppercase tracking-wide font-bold inline-block transition-transform duration-150 hover:scale-110 cursor-default" style={{ color: '#FF8C42', letterSpacing: '0.08em' }}>
                  6th Man
                </span>
              </TagTooltip>
            )}
            {activeEra && player.stats_by_era?.[activeEra] && (
              <span className="text-xs px-1.5 py-0.5 uppercase tracking-wide" style={{ color: G.grey, border: `1px solid ${G.border}` }}>
                {eraLabel(activeEra)} stats
              </span>
            )}
            {player.imputed_stats && player.imputed_stats.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 uppercase tracking-wide" style={{ color: G.greyDark, border: `1px solid ${G.border}` }}>
                ~ est.
              </span>
            )}
          </div>
        </div>
      </div>
      {usePillLayout && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {player.greatest_75_flag === 'Y' && (
            <TagTooltip tip="Recognized as one of the 75 greatest NBA players of all time, a small boost in every game play play.">
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${G.gold}44`, color: G.gold, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>75 Greatest</span>
            </TagTooltip>
          )}
          {(player.rings ?? 0) > 0 && (
            <TagTooltip tip="Champions perform better in the playoffs. The more championships, the better the playoff performer.">
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${G.gold}44`, color: G.gold, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>{player.rings}× Champ</span>
            </TagTooltip>
          )}
          {player.defAnchor && (
            <TagTooltip tip={(player.anchorTier ?? 1) === 1 ? "Elite defensive anchor. Defensive impact beyond the stat sheet. T1 carries a larger boost than T2." : "Solid defensive anchor. Defensive impact beyond the stat sheet. T1 carries a larger boost than T2."}>
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #4A9ECC44`, color: '#4A9ECC', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Def Anchor T{player.anchorTier ?? 1}</span>
            </TagTooltip>
          )}
          {player.offAnchor && (
            <TagTooltip tip={(player.anchorTier ?? 1) === 1 ? "Elite offensive engine. Major boost to team scoring and ball movement." : "Strong offensive contributor. Elevates the team's offense. T1 anchors carry a larger boost."}>
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${G.gold}44`, color: G.gold, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Off Anchor T{player.anchorTier ?? 1}</span>
            </TagTooltip>
          )}
          {player.floorGeneral && (
            <TagTooltip tip={(player.floorGeneralTier ?? 1) === 1 ? "Elite playmaker. Elevates team ball movement and shot quality. Boosts win probability through playmaking." : "Strong playmaker. Elevates team ball movement. Boosts win probability through playmaking."}>
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #E0D4FF44`, color: '#E0D4FF', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Floor General T{player.floorGeneralTier ?? 1}</span>
            </TagTooltip>
          )}
          {player.shootingStar && (
            <TagTooltip tip={(player.shootingStarTier ?? 1) === 1 ? "Boosts team spacing. Elite all-time shooter. T1 carries a larger boost than T2." : "Boosts team spacing. Special shooter. T1 carries a larger boost than T2."}>
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #F472B644`, color: '#F472B6', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Shooting Star T{player.shootingStarTier ?? 1}</span>
            </TagTooltip>
          )}
          {player.glassClean && (
            <TagTooltip tip="Elite rebounder. Crashes the boards on both ends, boosting team second-chance points and limiting opponent possessions.">
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #34D39944`, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Glass Cleaner</span>
            </TagTooltip>
          )}
          {player.timeless && (
            <TagTooltip tip={(player.timelessTier ?? 1) === 1 ? "Transcendent skill set. Minimal era penalties across all decades. Minor penalty only if 6+ eras from home era." : "Highly adaptable skill set. Takes half the normal era penalty across all decades."}>
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #C084FC44`, color: '#C084FC', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Timeless{(player.timelessTier ?? 1) === 2 ? ' T2' : ''}</span>
            </TagTooltip>
          )}
          {player.duoPartners && (
            <TagTooltip tip={(duoActiveCount ?? 0) > 0 ? `Dynamic Duo active. +${(duoActiveCount ?? 0) * 5} rating boost.` : `Draft ${player.duoPartners.join(' or ')} to activate the Dynamic Duo bonus (+5 per partner).`}>
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${(duoActiveCount ?? 0) > 0 ? '#4ECDC4' : '#4ECDC466'}`, color: (duoActiveCount ?? 0) > 0 ? '#4ECDC4' : '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Dynamic Duo</span>
            </TagTooltip>
          )}
          {player.flexPositions && (
            <TagTooltip tip="Can play multiple positions outside of their natural position, without penalty..">
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #2A6E99`, color: '#4A9ECC', background: '#4A9ECC18', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>Flex</span>
            </TagTooltip>
          )}
          {isSixthMan && (
            <TagTooltip tip="Sixth Man. Elite bench performer. Gets a +6 rating boost when playing off the bench.">
              <span className="inline-block transition-transform duration-150 hover:scale-110" style={{ fontSize: 11, padding: '3px 8px', border: `1px solid #FF8C4244`, color: '#FF8C42', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, cursor: 'default' }}>6th Man</span>
            </TagTooltip>
          )}
        </div>
      )}
      {/* Big three */}
      <div className="grid grid-cols-3 gap-px mb-3" style={{ background: G.border }}>
        {[['PTS', player.PTS], ['REB', player.REB], ['AST', player.AST]].map(([k, v]) => (
          <div key={String(k)} className="text-center py-3" style={{ background: 'rgba(0,0,0,0.55)' }}>
            <div className="text-2xl font-bold" style={{ ...BEBAS, color: G.gold, letterSpacing: '0.05em' }}>{Number(v).toFixed(1)}</div>
            <div className="text-xs" style={{ color: secDark }}>{k}</div>
          </div>
        ))}
      </div>
      {/* Secondary stats */}
      <div className="grid grid-cols-4 gap-px mb-px" style={{ background: G.border }}>
        {[
          ['TS%', ts + '%', false],
          ['FG%', ((player.FG_PCT ?? 0) * 100).toFixed(1) + '%', false],
          ['3P%', ((player.FG3_PCT ?? 0) * 100).toFixed(1) + '%', false],
          ['STL', fmt('STL', player.STL?.toFixed(1)), imp('STL')],
        ].map(([k, v, isEst]) => (
          <div key={String(k)} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="text-xs font-medium" style={{ color: isEst ? sec : G.white }}>{v}</div>
            <div className="text-xs" style={{ color: secDark }}>{k}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-px" style={{ background: G.border }}>
        {[
          ['BLK', fmt('BLK', player.BLK?.toFixed(1)), imp('BLK')],
          ['TOV', fmt('TOV', player.TOV?.toFixed(1)), imp('TOV')],
          ['HT',  player.height, false],
          ['WT',  player.weight, false],
        ].map(([k, v, isEst]) => (
          <div key={String(k)} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="text-xs font-medium" style={{ color: isEst ? sec : G.white }}>{v}</div>
            <div className="text-xs" style={{ color: secDark }}>{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-center" style={{ color: secDark }}>
        {(() => {
          if (!activeEra && !player.eraTeam) return `${player.from_year}–${player.to_year ?? 'present'}`
          const seasons = Math.max(1, Math.ceil(player.GP / 82))
          return `${seasons} ${seasons === 1 ? 'season' : 'seasons'}`
        })()}
      </div>
      {(devMode || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) && (
        <div className="mt-1 text-xs text-center" style={{ color: G.gold, opacity: 0.6, letterSpacing: '0.08em' }}>
          BASE {r.toFixed(1)}
        </div>
      )}
      {isSTier && (<>
        <div className="card-sheen-beam" />
        <div className="card-amethyst-sparkles">{Array.from({length:10}).map((_,i)=><span key={i}/>)}</div>
      </>)}
      {isATier && (<>
        <div className="card-sheen-beam" />
        <div className="card-gold-sparkles">{Array.from({length:10}).map((_,i)=><span key={i}/>)}</div>
      </>)}
    </div>
  )
}
