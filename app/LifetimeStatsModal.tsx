'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getLifetimeStats, clearLifetimeStats, type LifetimeStats } from '../lib/lifetimeStats'

const ALL_ERAS = ['50s','60s','70s','80s','90s','00s','10s','20s']

const G = {
  gold:      '#C9A84C',
  goldDim:   '#7A6430',
  goldFaint: 'rgba(201,168,76,0.10)',
  grey:      '#888888',
  greyDark:  '#333333',
  surface:   '#111111',
  border:    '#252525',
  white:     '#FFFFFF',
  black:     '#000000',
  purple:    '#9b6dff',
}
const BEBAS = '"Bebas Neue", Impact, sans-serif'
const INTER = 'Inter, system-ui, sans-serif'

type TabMode = 'normal' | 'salary_cap'

function eraLabel(era: string) {
  return era === '00s' ? '2000s' : era === '10s' ? '2010s' : era === '20s' ? '2020s' : era
}

function EraRow({ era, rec, best, worst, champs, pct, isMobile }: {
  era: string; rec: { wins: number; losses: number }; best?: { wins: number; losses: number };
  worst?: { wins: number; losses: number }; champs: number; pct: string; isMobile?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [sheenKey, setSheenKey] = useState(0)
  return (
    <div
      onMouseEnter={() => { setHovered(true); setSheenKey(k => k + 1) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', padding: '10px 16px',
        borderBottom: `1px solid ${G.border}`, gap: 12,
        position: 'relative', overflow: 'hidden',
        background: hovered ? 'rgba(201,168,76,0.05)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      {hovered && <div key={sheenKey} className="stat-box-sheen" />}
      <div style={{ fontFamily: BEBAS, fontSize: 18, color: G.gold, letterSpacing: '0.1em', width: 52 }}>{eraLabel(era)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: INTER, fontSize: 13, color: G.white }}>{rec.wins}–{rec.losses} <span style={{ color: G.grey, fontSize: 11 }}>({pct}%)</span></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
          {best && <div style={{ fontSize: 10, color: G.grey }}>Best: {best.wins}–{best.losses}</div>}
          {worst && <div style={{ fontSize: 10, color: G.greyDark }}>Worst: {worst.wins}–{worst.losses}</div>}
        </div>
      </div>
      {champs > 0 && (
        <div style={{ fontFamily: BEBAS, fontSize: 13, color: G.gold, letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {isMobile ? `Champs ${champs}×` : `Championships ${champs}×`}
        </div>
      )}
    </div>
  )
}

function HoverCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false)
  const [sheenKey, setSheenKey] = useState(0)
  return (
    <div
      onMouseEnter={() => { setHovered(true); setSheenKey(k => k + 1) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'scale(1.03)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        boxShadow: hovered ? '0 4px 18px rgba(201,168,76,0.12)' : 'none',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.35)' : G.border}`,
        ...style,
      }}
    >
      {hovered && <div key={sheenKey} className="stat-box-sheen" />}
      {children}
    </div>
  )
}

function StatBox({ label, value, sub, compact = false }: { label: string; value: string; sub?: string; compact?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [sheenKey, setSheenKey] = useState(0)
  return (
    <div
      onMouseEnter={() => { setHovered(true); setSheenKey(k => k + 1) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: G.surface,
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.35)' : G.border}`,
        padding: compact ? '10px 12px' : '14px 16px',
        flex: compact ? '1 1 calc(50% - 4px)' : 1,
        minWidth: 0,
        maxWidth: compact ? 'calc(50% - 4px)' : undefined,
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'scale(1.03)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        boxShadow: hovered ? '0 4px 18px rgba(201,168,76,0.12)' : 'none',
      }}
    >
      {hovered && <div key={sheenKey} className="stat-box-sheen" />}
      <div style={{ fontFamily: INTER, fontSize: compact ? 8 : 9, color: G.grey, letterSpacing: compact ? '0' : '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: BEBAS, fontSize: compact ? (value.length > 10 ? 14 : value.length > 7 ? 16 : value.length > 5 ? 19 : 22) : (value.length > 9 ? 24 : 32), color: G.gold, letterSpacing: '0.06em', lineHeight: 1, overflowWrap: 'anywhere' }}>{value}</div>
      {sub && <div style={{ fontFamily: INTER, fontSize: 10, color: G.grey, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function PlayerHighlightCard({ label, name, count, sub }: { label: string; name: string; count: number; sub?: string }) {
  const [hovered, setHovered] = useState(false)
  const [sheenKey, setSheenKey] = useState(0)
  return (
    <div
      onMouseEnter={() => { setHovered(true); setSheenKey(k => k + 1) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: G.surface, padding: '14px 16px', flex: 1,
        position: 'relative', overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.35)' : G.border}`,
        transform: hovered ? 'scale(1.03)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        boxShadow: hovered ? '0 4px 18px rgba(201,168,76,0.12)' : 'none',
      }}
    >
      {hovered && <div key={sheenKey} className="stat-box-sheen" />}
      <div style={{ fontFamily: INTER, fontSize: 9, color: G.grey, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 22, color: G.gold, letterSpacing: '0.06em', flex: 1, minWidth: 0, lineHeight: 1.05, wordBreak: 'break-word' }}>{name}</div>
        <div style={{ fontFamily: INTER, fontSize: 12, color: G.grey, flexShrink: 0 }}>{count}×</div>
      </div>
      {sub && <div style={{ fontFamily: INTER, fontSize: 10, color: G.grey, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function StatsPanel({ stats, isMobile }: { stats: LifetimeStats; isMobile: boolean }) {
  const winPct = stats.totalWins + stats.totalLosses > 0
    ? ((stats.totalWins / (stats.totalWins + stats.totalLosses)) * 100).toFixed(1)
    : '—'

  const mostDrafted      = Object.values(stats.playerDraftCounts).sort((a, b) => b.count - a.count)[0]
  const mostSuccessful   = Object.values(stats.playerChampionshipCounts ?? {}).sort((a, b) => b.count - a.count)[0]
  const mostBenched      = Object.values(stats.playerBenchCounts ?? {}).sort((a, b) => b.count - a.count)[0]
  const mostDraftedCoach = Object.values(stats.coachDraftCounts).sort((a, b) => b.count - a.count)[0]
  const favoriteEra      = Object.entries(stats.eraSpinCount).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
  const erasWithRecord   = ALL_ERAS.filter(e => stats.recordByEra[e])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <StatBox label="Drafts Completed" value={String(stats.draftsCompleted)} compact={isMobile} />
        <StatBox label="All-Time Record" value={`${stats.totalWins}–${stats.totalLosses}`} sub={`${winPct}% win rate`} compact={isMobile} />
        <StatBox label="Championships" value={String(stats.championshipsTotal)} compact={isMobile} />
      </div>

      {/* Second row */}
      <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 8 }}>
        <StatBox
          label="Best Record"
          value={stats.bestRecord ? `${stats.bestRecord.wins}–${stats.bestRecord.losses}` : '—'}
          sub={stats.bestRecord ? eraLabel(stats.bestRecord.era) : undefined}
          compact={isMobile}
        />
        <StatBox
          label="Worst Record"
          value={stats.worstRecord ? `${stats.worstRecord.wins}–${stats.worstRecord.losses}` : '—'}
          sub={stats.worstRecord ? eraLabel(stats.worstRecord.era) : undefined}
          compact={isMobile}
        />
        <StatBox
          label="Highest Rating"
          value={stats.highestTeamRating ? String(stats.highestTeamRating.rating) : '—'}
          sub={stats.highestTeamRating ? eraLabel(stats.highestTeamRating.era) : undefined}
          compact={isMobile}
        />
        <StatBox
          label="Favorite Era"
          value={favoriteEra ? eraLabel(favoriteEra[0]) : '—'}
          sub={favoriteEra ? `${favoriteEra[1]} played` : undefined}
          compact={isMobile}
        />
      </div>

      {/* Player highlights row 1 */}
      <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 8 }}>
        {mostDrafted && <PlayerHighlightCard label="Most Drafted Player" name={mostDrafted.name} count={mostDrafted.count} />}
        {mostSuccessful && <PlayerHighlightCard label="Most Successful Player" name={mostSuccessful.name} count={mostSuccessful.count} sub="rings" />}
      </div>

      {/* Player highlights row 2 */}
      <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 8 }}>
        {mostBenched && <PlayerHighlightCard label="Most Benched Player" name={mostBenched.name} count={mostBenched.count} sub="times benched" />}
        {mostDraftedCoach && <PlayerHighlightCard label="Most Drafted Coach" name={mostDraftedCoach.name} count={mostDraftedCoach.count} />}
      </div>

      {/* Record by era */}
      {erasWithRecord.length > 0 && (
        <div style={{ background: G.surface, border: `1px solid ${G.border}` }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${G.border}`, fontFamily: INTER, fontSize: 9, color: G.grey, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Record by Era
          </div>
          {erasWithRecord.map(era => {
            const rec = stats.recordByEra[era]!
            const best = stats.bestRecordByEra[era]
            const worst = stats.worstRecordByEra[era]
            const champs = stats.championshipsByEra[era] ?? 0
            const pct = ((rec.wins / (rec.wins + rec.losses)) * 100).toFixed(0)
            return (
              <EraRow key={era} era={era} rec={rec} best={best} worst={worst} champs={champs} pct={pct} isMobile={isMobile} />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function LifetimeStatsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabMode>('normal')
  const [stats, setStats] = useState<LifetimeStats | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sharing, setSharing] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setStats(getLifetimeStats(tab)) }, [tab])
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleShare = async () => {
    if (!shareCardRef.current || sharing || !stats) return
    setSharing(true)
    try {
      await document.fonts.ready
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#000000', logging: false,
      })
      const url = canvas.toDataURL('image/png')
      if (navigator.share) {
        const blob = await (await fetch(url)).blob()
        await navigator.share({ files: [new File([blob], 'eraball-stats.png', { type: 'image/png' })] })
      } else {
        const a = document.createElement('a')
        a.download = 'eraball-stats.png'
        a.href = url
        a.click()
      }
    } catch (e) { console.error(e) }
    finally { setSharing(false) }
  }

  if (!stats) return null

  const isEmpty = stats.draftsCompleted === 0
  const winPct = stats.totalWins + stats.totalLosses > 0
    ? ((stats.totalWins / (stats.totalWins + stats.totalLosses)) * 100).toFixed(1) : '—'
  const favoriteEra = Object.entries(stats.eraSpinCount).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
  const mostDrafted = Object.values(stats.playerDraftCounts).sort((a, b) => b.count - a.count)[0]

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: G.black, border: `1px solid ${G.border}`, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', fontFamily: INTER }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: BEBAS, fontSize: 28, color: G.gold, letterSpacing: '0.2em' }}>Lifetime Stats</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isEmpty && (
              <button
                onClick={handleShare}
                disabled={sharing}
                style={{ background: 'none', border: `1px solid ${G.border}`, color: G.grey, fontSize: 11, padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: INTER, fontWeight: 700, opacity: sharing ? 0.5 : 1, transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = G.gold; (e.currentTarget as HTMLButtonElement).style.color = G.gold }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = G.border; (e.currentTarget as HTMLButtonElement).style.color = G.grey }}
              >
                {sharing ? 'SAVING...' : 'SHARE'}
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.grey, fontSize: 18, cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 24px 0', borderBottom: `1px solid ${G.border}` }}>
          {(['normal', 'salary_cap'] as TabMode[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setConfirming(false) }}
              style={{
                padding: '8px 16px',
                marginBottom: -1,
                border: `1px solid ${tab === t ? (t === 'salary_cap' ? G.purple : G.gold) : 'transparent'}`,
                borderBottom: tab === t ? `1px solid ${G.black}` : `1px solid transparent`,
                background: 'transparent',
                color: tab === t ? (t === 'salary_cap' ? G.purple : G.gold) : G.grey,
                fontFamily: INTER,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t === 'normal' ? 'Normal Draft' : 'Salary Cap Draft'}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isEmpty ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontFamily: BEBAS, fontSize: 22, color: G.gold, letterSpacing: '0.12em', marginBottom: 10 }}>No runs completed yet</div>
              <div style={{ fontFamily: INTER, fontSize: 13, color: G.grey, lineHeight: 1.6 }}>
                Play a {tab === 'salary_cap' ? 'Salary Cap Draft' : 'Normal Draft'} to start tracking your stats.
              </div>
              <div style={{ fontFamily: INTER, fontSize: 11, color: G.greyDark, marginTop: 14, lineHeight: 1.6 }}>Stats are stored locally on this device<br />and do not carry over to other devices.</div>
            </div>
          ) : (
            <StatsPanel stats={stats} isMobile={isMobile} />
          )}

          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: INTER, fontSize: 10, color: G.greyDark }}>Stored locally. Does not carry over to other devices.</div>
            {confirming ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: G.grey }}>Reset {tab === 'salary_cap' ? 'Salary Cap' : 'Normal Draft'} stats?</span>
                <button onClick={() => { clearLifetimeStats(tab); setStats(getLifetimeStats(tab)); setConfirming(false) }}
                  style={{ padding: '4px 12px', background: '#CC333322', color: '#CC3333', border: '1px solid #CC3333', cursor: 'pointer', fontSize: 11, letterSpacing: '0.06em' }}>
                  Confirm
                </button>
                <button onClick={() => setConfirming(false)}
                  style={{ padding: '4px 12px', background: 'none', color: G.grey, border: `1px solid ${G.border}`, cursor: 'pointer', fontSize: 11 }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)}
                style={{ padding: '4px 12px', background: 'none', color: G.greyDark, border: `1px solid ${G.greyDark}`, cursor: 'pointer', fontSize: 11, letterSpacing: '0.06em' }}>
                Reset Stats
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden share card captured by html2canvas */}
      <div style={{ position: 'fixed', top: -9999, left: -9999, width: 640 }}>
        <div ref={shareCardRef} style={{ background: '#000000', padding: 32, fontFamily: INTER, width: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: `1px solid #252525`, paddingBottom: 16 }}>
            <div style={{ fontFamily: BEBAS, fontSize: 32, color: G.gold, letterSpacing: '0.2em' }}>ERA BALL</div>
            <div style={{ fontFamily: BEBAS, fontSize: 18, color: G.grey, letterSpacing: '0.15em' }}>
              {tab === 'salary_cap' ? 'SALARY CAP DRAFT' : 'NORMAL DRAFT'} · LIFETIME STATS
            </div>
          </div>
          {/* Row 1: Drafts / Record / Championships */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {[
              { label: 'DRAFTS', value: String(stats.draftsCompleted) },
              { label: 'RECORD', value: `${stats.totalWins}–${stats.totalLosses}`, sub: `${winPct}% win rate` },
              { label: 'CHAMPIONSHIPS', value: String(stats.championshipsTotal) },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ flex: 1, background: '#111', border: '1px solid #252525', padding: '10px 12px' }}>
                <div style={{ fontSize: 8, color: G.grey, letterSpacing: '0.18em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: BEBAS, fontSize: 26, color: G.gold, letterSpacing: '0.06em', lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: 9, color: G.grey, marginTop: 2 }}>{sub}</div>}
              </div>
            ))}
          </div>
          {/* Row 2: Best Record / Worst Record / Highest Rating / Favorite Era */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {[
              { label: 'BEST RECORD', value: stats.bestRecord ? `${stats.bestRecord.wins}–${stats.bestRecord.losses}` : '—', sub: stats.bestRecord ? eraLabel(stats.bestRecord.era) : undefined },
              { label: 'WORST RECORD', value: stats.worstRecord ? `${stats.worstRecord.wins}–${stats.worstRecord.losses}` : '—', sub: stats.worstRecord ? eraLabel(stats.worstRecord.era) : undefined },
              { label: 'HIGHEST RATING', value: stats.highestTeamRating ? String(stats.highestTeamRating.rating) : '—', sub: stats.highestTeamRating ? eraLabel(stats.highestTeamRating.era) : undefined },
              { label: 'FAVORITE ERA', value: favoriteEra ? eraLabel(favoriteEra[0]) : '—', sub: favoriteEra ? `${favoriteEra[1]} played` : undefined },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ flex: 1, background: '#111', border: '1px solid #252525', padding: '10px 12px' }}>
                <div style={{ fontSize: 8, color: G.grey, letterSpacing: '0.18em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: BEBAS, fontSize: 20, color: G.gold, letterSpacing: '0.06em', lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: 9, color: G.grey, marginTop: 2 }}>{sub}</div>}
              </div>
            ))}
          </div>
          {/* Row 3: Player highlights */}
          {(() => {
            const mostSuccessful = Object.values(stats.playerChampionshipCounts ?? {}).sort((a, b) => b.count - a.count)[0]
            const mostBenched    = Object.values(stats.playerBenchCounts ?? {}).sort((a, b) => b.count - a.count)[0]
            const mostCoach      = Object.values(stats.coachDraftCounts).sort((a, b) => b.count - a.count)[0]
            const highlights = [
              mostDrafted    && { label: 'MOST DRAFTED PLAYER',    name: mostDrafted.name,    count: mostDrafted.count },
              mostSuccessful && { label: 'MOST SUCCESSFUL PLAYER', name: mostSuccessful.name, count: mostSuccessful.count, sub: 'rings' },
              mostBenched    && { label: 'MOST BENCHED PLAYER',    name: mostBenched.name,    count: mostBenched.count },
              mostCoach      && { label: 'MOST DRAFTED COACH',     name: mostCoach.name,      count: mostCoach.count },
            ].filter(Boolean) as { label: string; name: string; count: number; sub?: string }[]
            return highlights.length > 0 ? (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                {highlights.map(h => (
                  <div key={h.label} style={{ flex: '1 1 calc(50% - 5px)', background: '#111', border: '1px solid #252525', padding: '10px 12px', minWidth: 0 }}>
                    <div style={{ fontSize: 8, color: G.grey, letterSpacing: '0.18em', marginBottom: 3 }}>{h.label}</div>
                    <div style={{ fontFamily: BEBAS, fontSize: 18, color: G.gold, letterSpacing: '0.06em', wordBreak: 'break-word' }}>
                      {h.name} <span style={{ color: G.grey, fontSize: 14 }}>{h.count}×</span>
                    </div>
                    {h.sub && <div style={{ fontSize: 9, color: G.grey, marginTop: 1 }}>{h.sub}</div>}
                  </div>
                ))}
              </div>
            ) : null
          })()}
          {/* Record by Era */}
          {(() => {
            const erasWithRecord = ALL_ERAS.filter(e => stats.recordByEra[e])
            return erasWithRecord.length > 0 ? (
              <div style={{ background: '#111', border: '1px solid #252525', marginBottom: 10 }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #252525', fontSize: 8, color: G.grey, letterSpacing: '0.18em' }}>RECORD BY ERA</div>
                {erasWithRecord.map(era => {
                  const rec = stats.recordByEra[era]!
                  const champs = stats.championshipsByEra[era] ?? 0
                  const pct = ((rec.wins / (rec.wins + rec.losses)) * 100).toFixed(0)
                  return (
                    <div key={era} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', borderBottom: '1px solid #1a1a1a' }}>
                      <div style={{ fontFamily: BEBAS, fontSize: 15, color: G.gold, letterSpacing: '0.1em', width: 48 }}>{eraLabel(era)}</div>
                      <div style={{ flex: 1, fontSize: 12, color: '#ccc' }}>{rec.wins}–{rec.losses} <span style={{ color: G.grey, fontSize: 10 }}>({pct}%)</span></div>
                      {champs > 0 && <div style={{ fontSize: 10, color: G.gold, fontWeight: 700 }}>🏆 {champs}×</div>}
                    </div>
                  )
                })}
              </div>
            ) : null
          })()}
          <div style={{ borderTop: `1px solid #252525`, paddingTop: 10, textAlign: 'center', fontSize: 11, color: '#555', letterSpacing: '0.12em' }}>
            ERABALL.COM
          </div>
        </div>
      </div>
    </div>
  )
}
