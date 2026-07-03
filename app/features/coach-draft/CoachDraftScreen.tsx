'use client'
// app/features/coach-draft/CoachDraftScreen.tsx
// Feature screen: the coach draft. v1.5.8 flow - a single spin reveals THREE coach
// choices; the player picks one. Respin budget is 3 when a bonus re-spin was carried
// over from the player draft (unused player re-spin), otherwise 2. Sandbox/dev pickers
// select a coach directly. Stateful feature module - composes shared atoms/modals and
// the component library.

import React, { useState } from 'react'
import type { Coach } from '@eraball/engine'
import { G, BEBAS } from '../../../src/components/tokens'
import { Btn } from '../../../src/components'
import { TopBar, CoachHeadshot } from '../../_shared'

// Grade -> color. Local to this module to match upstream's coach-draft palette
// (distinct from ResultCard's gradeColor, which uses a different mapping).
const gradeColor = (g: string) =>
  g === 'A' ? '#4ade80' : g === 'B' ? '#86efac' : g === 'C' ? G.gold : g === 'D' ? '#fb923c' : '#f87171'

export function CoachDraftScreen({ coaches, onCoachSelected, onRestart, sandboxMode, salaryCapMode, bonusCoachRespin, greyscaleBtn, muteBtn }: {
  coaches: Coach[]; onCoachSelected: (coach: Coach) => void; onRestart: () => void; sandboxMode?: boolean; salaryCapMode?: boolean; bonusCoachRespin?: boolean; greyscaleBtn?: React.ReactNode; muteBtn?: React.ReactNode
}) {
  const GRADE_RANK: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 }
  const eligibleCoaches = salaryCapMode ? coaches.filter(c => GRADE_RANK[c.overallGrade] >= 2) : coaches
  const [spinning, setSpinning] = useState(false)
  const [choices, setChoices] = useState<Coach[]>([])
  const [spinsUsed, setSpinsUsed] = useState(0)
  const [reelNames, setReelNames] = useState<[string, string, string]>(['', '', ''])
  const [reelKeys, setReelKeys] = useState<[number, number, number]>([0, 0, 0])
  const [reelPhase, setReelPhase] = useState<'fast' | 'slow' | 'land'>('fast')
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const [devMode, setDevMode] = useState(false)
  const [devSearch, setDevSearch] = useState('')
  const [sandboxSearch, setSandboxSearch] = useState('')

  const spin = () => {
    const three = [...eligibleCoaches].sort(() => Math.random() - 0.5).slice(0, Math.min(3, eligibleCoaches.length)) as [Coach, Coach, Coach]
    setSpinning(true)
    setChoices([])
    setSpinsUsed(n => n + 1)
    const schedule = [
      ...Array(10).fill(65),
      ...Array(5).fill(120),
      ...Array(3).fill(220),
    ]
    let ticks = 0
    const rnd = () => eligibleCoaches[Math.floor(Math.random() * eligibleCoaches.length)].name
    const doTick = () => {
      const phase: 'fast' | 'slow' = ticks < 10 ? 'fast' : 'slow'
      setReelPhase(phase)
      setReelNames([rnd(), rnd(), rnd()])
      setReelKeys(ks => [ks[0] + 1, ks[1] + 1, ks[2] + 1])
      if (ticks < schedule.length) {
        setTimeout(doTick, schedule[ticks++])
      } else {
        setReelPhase('land')
        setReelNames([three[0].name, three[1].name, three[2].name])
        setReelKeys(ks => [ks[0] + 1, ks[1] + 1, ks[2] + 1])
        setChoices(three)
        setTimeout(() => setSpinning(false), 350)
      }
    }
    doTick()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: G.black }}>
      <TopBar onRestart={onRestart} right={(greyscaleBtn || muteBtn) ? <div className="flex items-center gap-2 sm:gap-4">{greyscaleBtn}{muteBtn}</div> : undefined} />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div style={{ ...BEBAS, fontSize: 56, color: G.white, letterSpacing: '0.05em', lineHeight: 1 }}>
            Draft a Coach
          </div>
          <div className="text-xs mt-2 uppercase tracking-widest" style={{ color: G.grey }}>
            Spin to reveal 3 coaches. Pick the best fit for your roster.
          </div>
        </div>

        {!choices.length && !spinning && (
          <Btn onClick={spin} variant="gold" className="w-full py-4 text-base mb-4">
            Spin Coach
          </Btn>
        )}

        {sandboxMode && !spinning && (
          <div className="mb-4 relative">
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.greyDark }}>or search a coach</div>
            <input
              type="text"
              placeholder="Coach name..."
              value={sandboxSearch}
              onChange={e => setSandboxSearch(e.target.value)}
              style={{ width: '100%', background: G.surface, border: `1px solid ${G.border}`, color: G.white, padding: '8px 12px', fontSize: 13, outline: 'none' }}
            />
            {sandboxSearch.length > 1 && (
              <div className="roster-scroll" style={{ background: G.surface, border: `1px solid ${G.border}`, borderTop: 'none', maxHeight: 220, overflowY: 'auto' }}>
                {eligibleCoaches.filter(c => c.name.toLowerCase().includes(sandboxSearch.toLowerCase())).slice(0, 12).map(c => (
                  <div
                    key={`${c.name}-${c.from}`}
                    onClick={() => { onCoachSelected(c); setSandboxSearch('') }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: G.white, borderBottom: `1px solid ${G.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = G.surface2)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {c.name.replace('*', '')}{c.name.endsWith('*') ? ' ★' : ''}
                    <span style={{ color: G.greyDark, marginLeft: 8, fontSize: 11 }}>Off:{c.offGrade} Def:{c.defGrade} Ovr:{c.overallGrade}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {spinning && (
          <div className="flex flex-col gap-2 mb-4">
            {([0, 1, 2] as const).map(i => (
              <div key={i} style={{ background: G.surface, border: `1px solid ${G.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 72 }}>
                <div style={{ ...BEBAS, fontSize: 28, color: G.greyDark, letterSpacing: '0.05em' }}>
                  <span className="slot-reel-window">
                    <span
                      key={reelKeys[i]}
                      className={`slot-reel${reelPhase === 'slow' ? ' slot-reel--slow' : reelPhase === 'land' ? ' slot-reel--land' : ''}`}
                    >
                      {reelNames[i]}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!spinning && choices.length > 0 && spinsUsed < (bonusCoachRespin ? 3 : 2) && (
          <Btn onClick={spin} variant="ghost" className="w-full py-3 mb-3">
            Respin ({bonusCoachRespin ? 3 - spinsUsed : 2 - spinsUsed} left)
          </Btn>
        )}

        {!spinning && choices.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {choices.map(c => (
              <button
                key={`${c.name}-${c.from}`}
                onClick={() => onCoachSelected(c)}
                style={{ width: '100%', background: G.surface, border: `1px solid ${G.border}`, padding: '12px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.background = G.surface2 }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = G.surface }}
              >
                <CoachHeadshot name={c.name} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ ...BEBAS, fontSize: 20, color: G.white, letterSpacing: '0.04em' }}>
                      {c.name.replace('*', '')}
                    </span>
                    {c.name.endsWith('*') && <span style={{ color: G.gold, fontSize: 13 }}>★</span>}
                    {c.offGuru && c.defGuru && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: G.black, background: 'linear-gradient(90deg, #C9A84C, #4A9ECC)', padding: '1px 6px', textTransform: 'uppercase' }}>COMPLETE</span>}
                    {c.offGuru && !c.defGuru && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: G.black, background: G.gold, padding: '1px 6px', textTransform: 'uppercase' }}>OFF GURU</span>}
                    {c.defGuru && !c.offGuru && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: G.black, background: '#4A9ECC', padding: '1px 6px', textTransform: 'uppercase' }}>DEF GURU</span>}
                  </div>
                  <div style={{ fontSize: 11, color: G.grey, marginTop: 2 }}>
                    {c.from}–{c.to} · {c.regW}W–{c.regL}L
                    {c.champ > 0 && <span style={{ color: G.gold, marginLeft: 8 }}>{c.champ}× Champ</span>}
                    {c.conf > 0 && c.champ === 0 && <span style={{ color: G.greyDark, marginLeft: 8 }}>{c.conf} conf</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: G.greyDark }}>OFF: <span style={{ color: gradeColor(c.offGrade), fontWeight: 600 }}>{c.offGrade}</span></span>
                    <span style={{ fontSize: 10, color: G.greyDark }}>DEF: <span style={{ color: gradeColor(c.defGrade), fontWeight: 600 }}>{c.defGrade}</span></span>
                    <span style={{ fontSize: 10, color: G.greyDark }}>{c.playoffG > 0 ? `${(c.playoffWLPct * 100).toFixed(0)}% Playoffs` : 'No Playoffs'}</span>
                  </div>
                </div>
                <div style={{ ...BEBAS, fontSize: 44, color: gradeColor(c.overallGrade), lineHeight: 1, flexShrink: 0 }}>{c.overallGrade}</div>
              </button>
            ))}
          </div>
        )}
        <div className="text-xs text-center mt-4" style={{ color: G.greyDark }}>
          * Hall of Fame inductee
        </div>

        {/* DEV coach picker */}
        {isLocalhost && <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${G.border}` }}>
          <button
            onClick={() => { setDevMode(d => !d); setDevSearch('') }}
            className="dev-btn text-xs uppercase tracking-widest px-3 py-1"
            style={{ color: devMode ? G.gold : G.greyDark, border: `1px solid ${devMode ? G.goldDim : G.border}`, background: 'none', cursor: 'pointer' }}
          >
            DEV
          </button>
          {devMode && (
            <div className="mt-3 space-y-3">
              {/* Preset test coaches */}
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.greyDark }}>Test Presets</div>
              <div className="flex flex-col gap-1">
                {([
                  { label: 'F Off - A Def', off: 'F', def: 'A', ovr: 'C' },
                  { label: 'C Off - C Def', off: 'C', def: 'C', ovr: 'C' },
                  { label: 'A Off - F Def', off: 'A', def: 'F', ovr: 'C' },
                  { label: 'D Off - D Def', off: 'D', def: 'D', ovr: 'D' },
                  { label: 'B Off - B Def', off: 'B', def: 'B', ovr: 'B' },
                  { label: 'F Off - F Def', off: 'F', def: 'F', ovr: 'F' },
                ] as { label: string; off: Coach['offGrade']; def: Coach['defGrade']; ovr: Coach['overallGrade'] }[]).map(preset => {
                  const testCoach: Coach = {
                    name: `Test Coach (${preset.label})`, from: 2000, to: 2020, years: 20,
                    regG: 1640, regW: 820, regL: 820, regWLPct: 0.500,
                    playoffG: 80, playoffW: 40, playoffL: 40, playoffWLPct: 0.500,
                    conf: 0, champ: 0,
                    offGrade: preset.off, defGrade: preset.def, overallGrade: preset.ovr,
                  }
                  return (
                    <div
                      key={preset.label}
                      onClick={() => { onCoachSelected(testCoach); setDevMode(false) }}
                      style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: G.white, border: `1px solid ${G.border}`, background: G.surface }}
                      onMouseEnter={e => (e.currentTarget.style.background = G.surface2)}
                      onMouseLeave={e => (e.currentTarget.style.background = G.surface)}
                    >
                      {preset.label}
                    </div>
                  )
                })}
              </div>
              {/* Coach search */}
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: G.greyDark }}>Search Real Coach</div>
              <input
                type="text"
                placeholder="Coach name..."
                value={devSearch}
                onChange={e => setDevSearch(e.target.value)}
                style={{ width: '100%', background: G.surface, border: `1px solid ${G.border}`, color: G.white, padding: '8px 12px', fontSize: 13, outline: 'none' }}
              />
              {devSearch.length > 1 && (
                <div className="roster-scroll" style={{ background: G.surface, border: `1px solid ${G.border}`, borderTop: 'none', maxHeight: 200, overflowY: 'auto' }}>
                  {coaches.filter(c => c.name.toLowerCase().includes(devSearch.toLowerCase())).slice(0, 10).map(c => (
                    <div
                      key={`${c.name}-${c.from}`}
                      onClick={() => { onCoachSelected(c); setDevSearch(''); setDevMode(false) }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: G.white, borderBottom: `1px solid ${G.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = G.surface2)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {c.name}
                      <span style={{ color: G.greyDark, marginLeft: 8, fontSize: 11 }}>Off:{c.offGrade} Def:{c.defGrade} Ovr:{c.overallGrade}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>}
      </div>
      </div>
    </div>
  )
}
