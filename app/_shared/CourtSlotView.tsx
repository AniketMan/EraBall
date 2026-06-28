'use client'
// app/_shared/CourtSlotView.tsx
// Shared view atom: a single court slot (a roster position that can hold a player).
// Handles drag-and-drop, pending/confirmed states, fit/era glow, and the drag-ghost
// portal. Used by the Draft and Coach-draft screens. Engine helpers compute fit/era
// modifiers for display only.

import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Player, Era, CourtSlot } from '@eraball/engine'
import { calcFitPenalty, calcEraModifier, playerBaseRating } from '@eraball/engine'
import { G, BEBAS } from '../../src/components/tokens'
import { tierBg, eraLabel } from '../../src/lib/ui'
import { PlayerHeadshot } from '../../src/components'

export function CourtSlotView({ slot, onClick, onDrop, highlighted, pendingPlayer, activePlayer, simEra, sandboxMode, onRemove, onDragStart, fifties }: {
  slot: CourtSlot; onClick: () => void; onDrop: () => void; highlighted: boolean
  pendingPlayer?: Player | null; activePlayer?: Player | null; simEra?: Era
  sandboxMode?: boolean; onRemove?: () => void; onDragStart?: () => void; fifties?: boolean
}) {
  const [dragOver, setDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const confirmed = slot.player
  const isPending = !confirmed && !!pendingPlayer
  const sec     = fifties ? '#e2e2e2' : G.grey
  const secDark = fifties ? '#c8c8c8' : G.greyDark

  const { label: pendingFitLabel } = pendingPlayer ? calcFitPenalty(pendingPlayer, slot.position) : { label: null }

  // When a player is selected, compute fit for this slot to drive glow
  const activeFit = (activePlayer && !confirmed)
    ? calcFitPenalty(activePlayer, slot.position)
    : null

  const fitLabelColor = (label: string | null) =>
    label === 'Position Fit' ? G.gold : label?.includes('10%') ? '#C9A030' : label?.includes('25%') ? G.red : G.grey

  const duoActive = (confirmed?.duoActiveCount ?? 0) > 0

  const fitBorder = confirmed
    ? duoActive ? '#4ECDC4' : slot.fitLabel === 'Position Fit' ? G.gold : slot.fitLabel?.includes('10%') ? G.grey : G.red
    : activeFit
      ? activeFit.penalty === 0   ? G.gold
        : activeFit.penalty === 0.10 ? '#8B6914'
        : '#7A2020'
    : dragOver ? G.goldDim
    : G.border

  const fitGlow = activeFit
    ? activeFit.penalty === 0    ? '0 0 18px rgba(201,168,76,0.7), 0 0 6px rgba(201,168,76,0.4)'
      : activeFit.penalty === 0.10 ? '0 0 8px rgba(180,130,20,0.25)'
      : '0 0 8px rgba(204,51,51,0.35)'
    : 'none'

  const duoGlow = '0 0 14px rgba(78,205,196,0.55), 0 0 4px rgba(78,205,196,0.3)'

  return (
    <>
    <div
      ref={slotRef}
      className={`relative overflow-hidden cursor-pointer select-none court-slot${confirmed ? ' court-slot--filled' : ''}`}
      draggable={sandboxMode && !!confirmed}
      style={{
        minHeight: 140,
        background: isPending ? `${G.gold}0a` : confirmed ? tierBg(confirmed, fifties) : G.black,
        border: `1px solid ${dragOver ? G.gold : fitBorder}`,
        outline: isPending ? `1px solid ${G.goldDim}` : 'none',
        outlineOffset: '-3px',
        boxShadow: dragOver ? `0 0 18px rgba(201,168,76,0.45)` : duoActive ? duoGlow : confirmed ? 'none' : fitGlow,
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
        opacity: isDragging ? 0.35 : 1,
        cursor: sandboxMode && confirmed ? 'grab' : 'pointer',
      }}
      onClick={onClick}
      onDragStart={e => {
        const emptyImg = new Image()
        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
        e.dataTransfer.setDragImage(emptyImg, 0, 0)
        setGhostPos({ x: e.clientX, y: e.clientY })
        setIsDragging(true)
        onDragStart?.()
      }}
      onDrag={e => { if (e.clientX !== 0 || e.clientY !== 0) setGhostPos({ x: e.clientX, y: e.clientY }) }}
      onDragEnd={() => { setIsDragging(false); setGhostPos(null) }}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop() }}
    >
      {isPending && <div className="slot-pending-glow" />}
      {/* Position label + minutes (bench only) */}
      <div className="absolute top-1 left-1.5" style={{ lineHeight: 1 }}>
        <div style={{ ...BEBAS, letterSpacing: '0.1em' }} className="text-[11px] md:text-[16px]">
          <span style={{ color: fifties ? '#b0b0ba' : G.goldDim }}>{slot.position}</span>
        </div>
      </div>

      {/* Sandbox remove button on filled slots */}
      {sandboxMode && confirmed && onRemove && (
        <button
          className="absolute top-1 right-1.5 z-10"
          style={{ lineHeight: 1, color: G.greyDark, fontSize: 13, fontWeight: 700, padding: '0 2px' }}
          onClick={e => { e.stopPropagation(); onRemove() }}
          aria-label="Remove player"
        >×</button>
      )}

      {/* Fit indicator badge on empty slots when player is selected */}
      {activeFit && !isPending && (
        <div className="absolute top-1 right-1.5" style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: fitLabelColor(activeFit.label),
          opacity: 0.9,
        }}>
          {activeFit.penalty === 0 ? '✓' : activeFit.penalty === 0.10 ? '−10%' : '−25%'}
        </div>
      )}

      {confirmed && (() => {
        const cr = playerBaseRating(confirmed, confirmed.era as Era)
        if (cr >= 55) return (<>
          <div className="card-sheen-beam" />
          <div className="card-amethyst-sparkles">{Array.from({length:10}).map((_,i)=><span key={i}/>)}</div>
        </>)
        if (cr >= 46) return (<>
          <div className="card-sheen-beam" />
          <div className="card-gold-sparkles">{Array.from({length:10}).map((_,i)=><span key={i}/>)}</div>
        </>)
        return null
      })()}
      {confirmed ? (
        <div className="flex flex-col items-center px-2 pb-2 pt-5 gap-1.5">
          {fifties && (() => { const cr = playerBaseRating(confirmed, confirmed.era as Era); const tl = cr >= 55 ? 'S' : cr >= 46 ? 'A' : cr >= 38 ? 'B' : cr >= 31 ? 'C' : cr >= 24 ? 'D' : cr >= 16 ? 'E' : 'F'; return <div style={{ position: 'absolute', top: 4, right: 7, ...BEBAS, fontSize: 16, letterSpacing: '0.1em', color: '#c8c8d2', lineHeight: 1, zIndex: 2, pointerEvents: 'none' }}>{tl}</div> })()}
          <PlayerHeadshot personId={confirmed.person_id} size={52} initial={confirmed.position?.[0]} />
          <div className="w-full text-center min-w-0">
            <div className="font-semibold text-white leading-tight truncate" style={{ fontSize: 11 }}>{confirmed.full_name}</div>
            <div style={{ color: sec, fontSize: 10 }} className="mt-0.5 truncate">{confirmed.position} - {eraLabel(confirmed.era)}</div>
            {/* Desktop: x.x ppg / x.x rpg / x.x apg */}
            <div className="hidden md:flex justify-center items-baseline gap-1 mt-1 flex-wrap" style={{ fontSize: 10 }}>
              <span style={{ color: G.gold, fontWeight: 700 }}>{confirmed.PTS?.toFixed(1)}</span>
              <span style={{ color: secDark, fontSize: 8 }}>ppg</span>
              <span style={{ color: secDark }}>·</span>
              <span style={{ color: sec }}>{confirmed.REB?.toFixed(1)}</span>
              <span style={{ color: secDark, fontSize: 8 }}>rpg</span>
              <span style={{ color: secDark }}>·</span>
              <span style={{ color: sec }}>{confirmed.AST?.toFixed(1)}</span>
              <span style={{ color: secDark, fontSize: 8 }}>apg</span>
            </div>
            {/* Mobile: pts/reb/ast rounded to nearest whole number */}
            <div className="flex md:hidden justify-center mt-1" style={{ fontSize: 11, color: G.gold, fontWeight: 700 }}>
              {Math.round(confirmed.PTS ?? 0)}<span style={{ color: G.greyDark }}>/</span>{Math.round(confirmed.REB ?? 0)}<span style={{ color: G.greyDark }}>/</span>{Math.round(confirmed.AST ?? 0)}
            </div>
            {!!confirmed.FG3_PCT && simEra && !['50s', '60s', '70s'].includes(simEra) && (
              <div className="mt-0.5" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: confirmed.FG3_PCT >= 0.40 ? G.gold : confirmed.FG3_PCT >= 0.37 ? '#C9A030' : confirmed.FG3_PCT >= 0.34 ? G.grey : confirmed.FG3_PCT >= 0.30 ? G.greyDark : G.red }}>
                {(confirmed.FG3_PCT * 100).toFixed(1)}% 3PT
              </div>
            )}
            {slot.fitLabel && <div className="mt-1" style={{ fontSize: 10, color: fitLabelColor(slot.fitLabel) }}>{slot.fitLabel}</div>}
            {simEra && (() => { const mod = calcEraModifier(confirmed, simEra); return (
              <div className="mt-0.5" style={{ fontSize: 9, color: mod >= 1.0 ? G.gold : (mod < 0.75 && !fifties) ? G.red : sec, letterSpacing: '0.05em' }}>
                Era Fit {Math.round(mod * 100)}%
              </div>
            ) })()}
            {confirmed.flexPositions && <div className="mt-1" style={{ fontSize: 10, fontWeight: 700, color: '#4A9ECC', letterSpacing: '0.08em' }}>FLEX</div>}
          </div>
        </div>
      ) : isPending && pendingPlayer ? (
        <div className="flex flex-col items-center px-2 pb-2 pt-5 gap-1.5 slot-player-enter">
          <PlayerHeadshot personId={pendingPlayer.person_id} size={52} initial={pendingPlayer.position?.[0]} />
          <div className="w-full text-center min-w-0">
            <div className="font-semibold text-white leading-tight truncate" style={{ fontSize: 11 }}>{pendingPlayer.full_name}</div>
            <div style={{ color: sec, fontSize: 10 }} className="mt-0.5">{pendingPlayer.position} - {eraLabel(pendingPlayer.era)}</div>
            {pendingFitLabel && <div className="mt-1" style={{ fontSize: 10, color: fitLabelColor(pendingFitLabel) }}>{pendingFitLabel}</div>}
            {simEra && (() => { const mod = calcEraModifier(pendingPlayer, simEra); return (
              <div className="mt-0.5" style={{ fontSize: 9, color: mod >= 1.0 ? G.gold : (mod < 0.75 && !fifties) ? G.red : sec, letterSpacing: '0.05em' }}>
                Era Fit {Math.round(mod * 100)}%
              </div>
            ) })()}
            <div style={{ fontSize: 9, color: G.goldDim, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="mt-1 sm:hidden">Pending - Tap to lock {slot.position}</div>
            <div style={{ fontSize: 9, color: G.goldDim, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="mt-1 hidden sm:block">Pending - Click to lock {slot.position}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ height: 120 }}>
          <span className="text-xs" style={{ color: activeFit ? fitLabelColor(activeFit.label) : highlighted ? G.goldDim : G.greyDark }}>
            {activeFit ? '+ place here' : highlighted ? '+ place here' : '—'}
          </span>
        </div>
      )}
    </div>
    {ghostPos && confirmed && typeof document !== 'undefined' && createPortal(
      <div style={{
        position: 'fixed',
        left: ghostPos.x,
        top: ghostPos.y,
        transform: 'translate(-50%, -60%) rotate(3deg) scale(1.08)',
        pointerEvents: 'none',
        zIndex: 9999,
        width: slotRef.current?.offsetWidth ?? 130,
        background: tierBg(confirmed, fifties),
        border: `1px solid ${G.gold}`,
        boxShadow: '0 24px 48px rgba(0,0,0,0.85), 0 0 20px rgba(201,168,76,0.25)',
        borderRadius: 4,
        overflow: 'hidden',
        padding: '20px 8px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <img
          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${confirmed.person_id}.png`}
          alt=""
          referrerPolicy="no-referrer"
          style={{ width: 52, height: 52, borderRadius: '50%', border: `1px solid ${G.goldDim}`, objectFit: 'cover', objectPosition: 'top', background: G.surface2 }}
        />
        <div style={{ textAlign: 'center', color: G.white, fontWeight: 600, fontSize: 11, lineHeight: 1.2 }}>{confirmed.full_name}</div>
        <div style={{ color: G.grey, fontSize: 10 }}>{confirmed.position} · {eraLabel(confirmed.era)}</div>
      </div>,
      document.body,
    )}
    </>
  )
}
