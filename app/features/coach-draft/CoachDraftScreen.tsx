'use client'
// app/features/coach-draft/CoachDraftScreen.tsx
// Feature screen: the coach draft (slot-machine spin, reroll, sandbox/dev search pickers).
// Stateful feature module - composes shared atoms/modals and the component library.

import React, { useState } from 'react'
import type { Coach } from '@eraball/engine'
import { coachChampBonus } from '@eraball/engine'
import { G, BEBAS } from '../../../src/components/tokens'
import { Btn, GradeDisplay, TagTooltip } from '../../../src/components'
import { TopBar, CoachHeadshot } from '../../_shared'

export function CoachDraftScreen({ coaches, onCoachSelected, onRestart, sandboxMode, salaryCapMode, greyscaleBtn, muteBtn }: {
  coaches: Coach[]; onCoachSelected: (coach: Coach) => void; onRestart: () => void; sandboxMode?: boolean; salaryCapMode?: boolean; greyscaleBtn?: React.ReactNode; muteBtn?: React.ReactNode
}) {
  const GRADE_RANK: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 }
  const eligibleCoaches = salaryCapMode ? coaches.filter(c => GRADE_RANK[c.overallGrade] >= 2) : coaches
  const [spinning, setSpinning] = useState(false)
  const [coach, setCoach] = useState<Coach | null>(null)
  const [spinsUsed, setSpinsUsed] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [spinKey, setSpinKey] = useState(0)
  const [spinPhase, setSpinPhase] = useState<'fast' | 'slow' | 'land'>('fast')
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const [devMode, setDevMode] = useState(false)
  const [devSearch, setDevSearch] = useState('')
  const [sandboxSearch, setSandboxSearch] = useState('')

  const spin = () => {
    setSpinning(true)
    setSpinsUsed(n => n + 1)
    setCoach(null)
    const schedule = [
      ...Array(10).fill(65),
      ...Array(5).fill(120),
      ...Array(3).fill(220),
    ]
    let ticks = 0
    const doTick = () => {
      const phase: 'fast' | 'slow' = ticks < 10 ? 'fast' : 'slow'
      setSpinPhase(phase)
      setDisplayName(eligibleCoaches[Math.floor(Math.random() * eligibleCoaches.length)].name)
      setSpinKey(k => k + 1)
      if (ticks < schedule.length) {
        setTimeout(doTick, schedule[ticks++])
      } else {
        const picked = eligibleCoaches[Math.floor(Math.random() * eligibleCoaches.length)]
        setSpinPhase('land')
        setSpinKey(k => k + 1)
        setDisplayName(picked.name)
        setCoach(picked)
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
            A great coach elevates your roster, a bad one can hold it back. You have 3 chances.
          </div>
        </div>

        {!coach && !spinning && (
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
                    onClick={() => { setCoach(c); setDisplayName(c.name); setSandboxSearch('') }}
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

        {(spinning || displayName) && (
          <div className="flex items-center justify-center gap-4 mb-4 py-4" style={{ borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
            {!spinning && <CoachHeadshot name={displayName} size={52} />}
            <div style={{ ...BEBAS, fontSize: 28, color: spinning ? G.greyDark : G.white, letterSpacing: '0.05em' }}>
              <span className="slot-reel-window">
                <span
                  key={spinKey}
                  className={spinning || spinPhase === 'land' ? `slot-reel${spinPhase === 'slow' ? ' slot-reel--slow' : spinPhase === 'land' ? ' slot-reel--land' : ''}` : ''}
                >
                  {displayName}
                </span>
              </span>
            </div>
          </div>
        )}

        {coach && !spinning && (
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, padding: '20px', marginBottom: 16 }}>
            <div className="flex items-start gap-4 mb-4">
              <CoachHeadshot name={coach.name} size={72} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div style={{ ...BEBAS, fontSize: 28, color: G.white, letterSpacing: '0.04em' }}>
                        {coach.name.replace('*', '')}
                        {coach.name.endsWith('*') && <span style={{ color: G.gold, fontSize: 18, marginLeft: 4 }}>★</span>}
                      </div>
                      {coach.offGuru && coach.defGuru ? (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: G.black, background: 'linear-gradient(90deg, #C9A84C, #4A9ECC)', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>COMPLETE</span>
                      ) : (<>
                        {coach.offGuru && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: G.black, background: G.gold, padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase' }}>OFF GURU</span>
                        )}
                        {coach.defGuru && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: G.black, background: '#4A9ECC', padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase' }}>DEF GURU</span>
                        )}
                      </>)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: G.grey }}>
                      {coach.from}–{coach.to} - {coach.regW}W–{coach.regL}L ({(coach.regWLPct * 100).toFixed(1)}%)
                    </div>
                    <div className="flex flex-wrap gap-x-3 mt-1.5" style={{ fontSize: 11, color: G.greyDark }}>
                      <span style={{ color: G.grey }}>{coach.playoffG > 0 ? `${(coach.playoffWLPct * 100).toFixed(1)}% playoffs` : 'No playoffs'}</span>
                      {coach.champ > 0 && <><span>·</span>
                        <TagTooltip tip={`${Math.min(coach.champ, 8)}× title${coach.champ > 8 ? ' (capped at 8)' : ''}. Coaches who've won it all provide a small but real edge to your team. +${(coachChampBonus(coach) * 100).toFixed(1)}% team rating.`}>
                          <span style={{ color: G.gold }}>{coach.champ}× Champion</span>
                        </TagTooltip>
                      </>}
                      {coach.conf > 0 && coach.champ === 0 && <><span>·</span><span style={{ color: G.grey }}>{coach.conf} conf title{coach.conf !== 1 ? 's' : ''}</span></>}
                    </div>
                  </div>
                  <div style={{ ...BEBAS, fontSize: 48, color: G.gold, letterSpacing: '0.05em', lineHeight: 1 }}>
                    {coach.overallGrade}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px" style={{ background: G.border }}>
              <GradeDisplay grade={coach.offGrade} label="Offense" />
              <GradeDisplay grade={coach.defGrade} label="Defense" />
              <GradeDisplay grade={coach.overallGrade} label="Overall" />
            </div>
          </div>
        )}

        {coach && !spinning && (
          <div className="flex gap-2">
            {spinsUsed < 3 && (
              <Btn onClick={spin} variant="ghost" className="flex-1 py-3">
                Reroll ({3 - spinsUsed} left)
              </Btn>
            )}
            <Btn onClick={() => onCoachSelected(coach)} variant="gold" className="flex-1 py-3">
              Accept Coach
            </Btn>
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
                      onClick={() => { setCoach(testCoach); setDisplayName(testCoach.name); setDevMode(false) }}
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
                      onClick={() => { setCoach(c); setDisplayName(c.name); setDevSearch(''); setDevMode(false) }}
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
