'use client'
// app/features/era-selection/EraSelection.tsx
// Feature screen: the landing / era-selection menu (era cards, mode entry, top-level nav).
// Owns its EraSelection-specific display data (ERA_YEARS, ERA_DESC).

import React, { useState, useEffect, useRef } from 'react'
import type { Era } from '@eraball/engine'
import { ALL_ERAS } from '@eraball/engine'
import { G, BEBAS } from '../../../src/components/tokens'
import { Btn } from '../../../src/components'
import { eraLabel, R2 } from '../../../src/lib/ui'
import { TopBar, HowToPlayModal, PatchNotesModal } from '../../_shared'

const ERA_YEARS: Record<Era, string> = {
  '50s': '1950–1959', '60s': '1960–1969', '70s': '1970–1979', '80s': '1980–1989',
  '90s': '1990–1999', '00s': '2000–2009', '10s': '2010–2019', '20s': '2020–present',
}

const ERA_DESC: Record<Era, { style: string; note: string }> = {
  '50s': { style: 'Slow, physical, half-court basketball. No 3-point line, and very low scoring. Big men ruled the paint.', note: 'Pre-3pt - Modern shooters lose value here' },
  '60s': { style: 'Dominant big men, intense defense. Bill Russell era. Athleticism beginning to shape the game.', note: 'Pre-3pt - Modern shooters lose value here' },
  '70s': { style: 'ABA Merger. Brutal physical defense. Kareem\'s sky hook.', note: 'Pre-3pt - Modern shooters lose value here' },
  '80s': { style: '3-point line introduced in the league. Magic vs Bird.', note: '3pt era begins - Pre-3pt bigs take a cut' },
  '90s': { style: 'All time Defenses, Lower scoring. Hand-checking allowed. The Jordan era.', note: 'Defense Era - Most eras cross over cleanly' },
  '00s': { style: 'Post-Jordan transition. the Shaq and Kobe Era. Rising international talent. Introduction of the 4 round, best of 7 Playoffs. ', note: 'Bridge era - Minimal penalties most directions' },
  '10s': { style: '3-point volume surges. Steph vs Lebron. Rise of Positionless basketball.', note: 'Near-modern - Very low era penalties' },
  '20s': { style: 'Peak spacing, pace, and 3-point volume. Versatility is everything. Old-school bigs and pre-3pt era (50s/60s/70s) players struggle most here.', note: 'Current era - 2020s players at full strength' },
}

export function EraSelection({ onEraSelected, onSandboxSelected, onSalaryCapSelected, onRestart, onLifetimeStats, onLeaderboard, onAchievements, onEraPreview, muteBtn, eraThemeBtn }: { onEraSelected: (era: Era) => void; onSandboxSelected: (era: Era) => void; onSalaryCapSelected: (era: Era) => void; onRestart: () => void; onLifetimeStats: () => void; onLeaderboard: () => void; onAchievements: () => void; onEraPreview?: (era: Era) => void; muteBtn?: React.ReactNode; eraThemeBtn?: React.ReactNode }) {
  const [spinning, setSpinning] = useState(false)
  const [era, setEra] = useState<Era | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  useEffect(() => { try { if (!localStorage.getItem('eraball_seen_help')) setShowHelp(true) } catch {} }, [])
  const [displayEra, setDisplayEra] = useState<Era | null>(null)
  const [spinKey, setSpinKey] = useState(0)
  const [spinPhase, setSpinPhase] = useState<'fast' | 'slow' | 'land'>('fast')
  const [showPatchNotes, setShowPatchNotes] = useState(false)

  const spinRandom = () => {
    setSpinning(true)
    setEra(null)
    const schedule = [
      ...Array(10).fill(65),
      ...Array(5).fill(120),
      ...Array(3).fill(220),
    ]
    let ticks = 0
    const doTick = () => {
      const phase: 'fast' | 'slow' = ticks < 10 ? 'fast' : 'slow'
      setSpinPhase(phase)
      setDisplayEra(ALL_ERAS[Math.floor(Math.random() * ALL_ERAS.length)])
      setSpinKey(k => k + 1)
      if (ticks < schedule.length) {
        setTimeout(doTick, schedule[ticks++])
      } else {
        const picked = ALL_ERAS[Math.floor(Math.random() * ALL_ERAS.length)]
        setSpinPhase('land')
        setSpinKey(k => k + 1)
        setDisplayEra(picked)
        setEra(picked)
        onEraPreview?.(picked)
        setTimeout(() => setSpinning(false), 350)
      }
    }
    doTick()
  }

  const selectEra = (e: Era) => {
    if (spinning) return
    setEra(e)
    setDisplayEra(e)
    onEraPreview?.(e)
  }

  const stepEra = (dir: 1 | -1) => {
    if (spinning) return
    const idx = era ? ALL_ERAS.indexOf(era) : -1
    const next = ALL_ERAS[Math.max(0, Math.min(ALL_ERAS.length - 1, idx + dir))]
    if (next !== era) selectEra(next)
  }

  // Keyboard arrow navigation
  React.useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); stepEra(1) }
      if (ev.key === 'ArrowLeft')  { ev.preventDefault(); stepEra(-1) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  // Starfield
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const STAR_COUNT = 150, SPEED = 0.6
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * window.innerWidth * 2,
      y: (Math.random() - 0.5) * window.innerHeight * 2,
      z: Math.random() * window.innerWidth,
      px: 0, py: 0,
    }))
    let animId: number
    const tick = () => {
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, fl = W * 0.5
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, W, H)
      for (const s of stars) {
        const sx = (s.x / s.z) * fl + cx
        const sy = (s.y / s.z) * fl + cy
        const prog = 1 - s.z / W
        const r = Math.max(0.3, prog * 2.2)
        const op = 0.15 + prog * 0.85
        if (s.px !== 0 && s.py !== 0) {
          ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(sx, sy)
          ctx.strokeStyle = `rgba(255,255,255,${op * 0.5})`
          ctx.lineWidth = r * 0.8; ctx.stroke()
        }
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${op})`; ctx.fill()
        s.px = sx; s.py = sy; s.z -= SPEED
        if (s.z <= 0 || sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) {
          s.x = (Math.random() - 0.5) * W * 2
          s.y = (Math.random() - 0.5) * H * 2
          s.z = W; s.px = 0; s.py = 0
        }
      }
      animId = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: G.black, position: 'relative' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar onRestart={onRestart} right={(eraThemeBtn || muteBtn) ? <div className="flex items-center gap-2 sm:gap-4">{eraThemeBtn}{muteBtn}</div> : undefined} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-10" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
        {/* Selected era display */}
        <div className="text-center" style={{ minHeight: displayEra ? 260 : 0, width: '100%' }}>
          {displayEra && (
            <div>
              <div className="text-xs uppercase tracking-[0.4em] mb-2" style={{ color: G.grey }}>Simulation Era</div>
              <div style={{ position: 'relative', width: '100%', maxWidth: 680, margin: '0 auto' }}>
                {/* Era banner image — overlay gradient divs replace CSS mask for universal browser support */}
                <img
                  key={displayEra}
                  src={`${R2}/${displayEra}.webp`}
                  alt=""
                  className="era-banner-img"
                  onError={e => {
                    const img = e.currentTarget as HTMLImageElement
                    if (!img.src.includes('assets.eraball.com')) {
                      img.src = `https://assets.eraball.com/${displayEra}.webp`
                    } else {
                      img.style.display = 'none'
                    }
                  }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }}
                />
                {/* Left/right fade */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to right, #000 0%, transparent 18%, transparent 82%, #000 100%)' }} />
                {/* Top/bottom fade */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to bottom, #000 0%, transparent 20%, transparent 80%, #000 100%)' }} />
                <div style={{ ...BEBAS, fontSize: 'clamp(80px, 18vw, 160px)', lineHeight: 0.9, color: spinning ? G.greyDark : G.white, letterSpacing: '0.02em', position: 'relative', zIndex: 2, padding: '24px 48px', textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6)' }}>
                  <span className="slot-reel-window">
                    <span
                      key={spinKey}
                      className={spinning || spinPhase === 'land' ? `slot-reel${spinPhase === 'slow' ? ' slot-reel--slow' : spinPhase === 'land' ? ' slot-reel--land' : ''}` : ''}
                    >
                      {eraLabel(displayEra)}
                    </span>
                  </span>
                </div>
              </div>
              {!spinning && era && (
                <>
                  <div className="mt-3 text-xs uppercase tracking-[0.3em]" style={{ color: G.goldDim }}>
                    {ERA_YEARS[era]}
                  </div>
                  <div className="mt-4 max-w-xs mx-auto" style={{ fontSize: 13, color: G.grey, lineHeight: 1.6 }}>
                    {ERA_DESC[era].style}
                  </div>
                  <div className="mt-3 inline-block px-3 py-1" style={{
                    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: G.goldDim, border: `1px solid ${G.goldDim}`,
                  }}>
                    {ERA_DESC[era].note}
                  </div>
                  <div className="mt-3 text-xs" style={{ color: G.greyDark, letterSpacing: '0.04em' }}>
                    Players perform best in their home era - drafting across decades applies a rating penalty
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Era grid */}
        <div className="w-full max-w-sm">
          {!displayEra && (
            <div className="text-center mb-4" style={{ ...BEBAS, fontSize: 20, letterSpacing: '0.25em', color: G.greyDark }}>
              Select an era
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
          {ALL_ERAS.map(e => (
            <button
              key={e}
              onClick={() => selectEra(e)}
              disabled={spinning}
              className={`py-4 era-btn${era === e ? ' era-btn--active' : ''}`}
              style={{
                ...BEBAS,
                fontSize: 22,
                letterSpacing: '0.08em',
                background: era === e ? G.gold : G.surface,
                border: `1px solid ${era === e ? G.gold : G.border}`,
                color: era === e ? G.black : G.grey,
                cursor: spinning ? 'not-allowed' : 'pointer',
                opacity: spinning ? 0.4 : 1,
              }}
            >
              {eraLabel(e)}
            </button>
          ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
<Btn onClick={spinRandom} disabled={spinning} variant="ghost" className="w-48 py-3">
            {spinning ? 'Spinning...' : 'Random'}
          </Btn>
          {era && !spinning && (
            <Btn onClick={() => onEraSelected(era)} variant="gold" className="w-48 py-4 text-base" style={{ animation: 'begin-draft-pulse 2s ease-in-out infinite' }}>
              Normal Draft
            </Btn>
          )}
          {era && !spinning && (
            <Btn onClick={() => onSalaryCapSelected(era)} variant="ghost" className="w-48 py-3 salary-cap-pulse" style={{ borderColor: '#9b6dff', color: '#9b6dff' }}>
              Salary Cap Draft
            </Btn>
          )}
          <button
            onClick={() => setShowHelp(true)}
            className="text-xs uppercase tracking-widest"
            style={{ background: 'none', border: 'none', color: G.greyDark, padding: '2px 0', cursor: 'pointer', letterSpacing: '0.2em', transition: 'color 0.12s ease' }}
            onMouseEnter={e => { e.currentTarget.style.color = G.gold }}
            onMouseLeave={e => { e.currentTarget.style.color = G.greyDark }}
          >
            How to Play
          </button>
          {era && !spinning && (
            <>
              <span className="text-xs uppercase tracking-widest" style={{ color: G.greyDark }}>or play</span>
              <Btn onClick={() => onSandboxSelected(era)} variant="ghost" className="w-48 py-3 text-sm">
                Sandbox
              </Btn>
            </>
          )}
          <Btn onClick={onLeaderboard} variant="ghost" className="w-48 py-3 text-sm">
            Leaderboard
          </Btn>
          <Btn onClick={onLifetimeStats} variant="ghost" className="w-48 py-3 text-sm">
            Lifetime Stats
          </Btn>
          <Btn onClick={onAchievements} variant="ghost" className="w-48 py-3 text-sm">
            Achievements
          </Btn>
          <button
            onClick={() => setShowPatchNotes(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: G.gold, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, marginTop: 4 }}
          >
            What's New!
          </button>
          <div style={{ fontSize: 10, color: G.greyDark, letterSpacing: '0.15em', marginTop: 2 }}>v1.5.1</div>
          <div style={{ fontSize: 9, color: '#CC8844', letterSpacing: '0.04em', marginTop: 8, maxWidth: 280, lineHeight: 1.6, textAlign: 'center' }}>
            
          </div>
        </div>
      </div>
      {showPatchNotes && <PatchNotesModal onClose={() => setShowPatchNotes(false)} />}
      {showHelp && <HowToPlayModal onClose={() => {
        try { localStorage.setItem('eraball_seen_help', '1') } catch {}
        setShowHelp(false)
      }} />}
      </div>
    </div>
  )
}
