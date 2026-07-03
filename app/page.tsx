'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { Player, Coach, CourtSlot, Era, GamePhase } from '@eraball/engine'
import LifetimeStatsModal from './LifetimeStatsModal'
import LeaderboardModal from './LeaderboardModal'
import AchievementsModal from './AchievementsModal'
import { type Achievement } from '../lib/achievements'
// Anti-corruption service layer: the UI talks to these modules, never to supabase /
// fetch / proxy routes directly. Each degrades gracefully (live backend -> static fork).
import { loadGameData } from '../services/playerData'
// Shared presentational component library (pure, prop-driven, Storybook-cataloged).
import { FooterLink, FooterButton } from '../src/components'
// Canonical design tokens (single source shared with the component library).
import { G, BEBAS } from '../src/components/tokens'
// Shared UI helper functions (display-only helpers, see module header).
import { emptySlots } from '../src/lib/ui'
// Shared app-level UI: game-specific view atoms and modals reused across feature screens.
import { SupportersModal } from './_shared'
// Feature screens (self-contained stateful modules under app/features/).
import { EraSelection } from './features/era-selection/EraSelection'
import { DraftScreen } from './features/draft/DraftScreen'
import { CoachDraftScreen } from './features/coach-draft/CoachDraftScreen'
import { SimulationScreen } from './features/simulation/SimulationScreen'



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
  const [draftRespinUsed, setDraftRespinUsed] = useState(false)
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
      {phase === 'draft' && <DraftScreen simEra={simEra} players={players} onDraftComplete={(s, ce, wasSandbox, respinUsed) => { setSlots(s); setDraftCustomEras(ce); setDraftWasSandbox(wasSandbox); setDraftRespinUsed(respinUsed); setPhase('coach-draft') }} onRestart={restart} startInSandbox={startSandbox} salaryCapMode={salaryCapMode} greyscaleBtn={greyscaleBtn} muteBtn={muteBtn} themeFilter={eraFilter} />}
      {phase === 'coach-draft' && <CoachDraftScreen coaches={coaches} onCoachSelected={c => { setCoach(c); setPhase('simulation') }} onRestart={restart} sandboxMode={draftWasSandbox} salaryCapMode={salaryCapMode} bonusCoachRespin={!draftRespinUsed && !draftWasSandbox} draftedPlayerNames={new Set(slots.filter(s => s.player).map(s => s.player!.full_name))} greyscaleBtn={greyscaleBtn} muteBtn={muteBtn} />}
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
