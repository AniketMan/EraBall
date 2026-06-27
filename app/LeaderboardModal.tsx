'use client'

import React, { useState, useEffect } from 'react'
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardRoster } from '../lib/supabase'

const ALL_ERAS = ['50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s']
const ERA_LABEL: Record<string, string> = { '00s': '2000s', '10s': '2010s', '20s': '2020s' }
const eraLabel = (e: string) => ERA_LABEL[e] ?? e.toUpperCase()

const PLAYOFF_LABEL: Record<string, string> = {
  champion:     '🏆 Champion',
  finals:       'Finals Exit',
  conf_finals:  'Conf Finals',
  second_round: '2nd Round',
  first_round:  '1st Round',
}

const G = {
  gold: '#C9A84C', grey: '#888888', greyDark: '#aaaaaa',
  surface: '#111111', surface2: '#1a1a1a', border: '#252525',
  white: '#ffffff', black: '#000000', red: '#CC4444', purple: '#9b6dff', green: '#4caf78',
}
const BEBAS = { fontFamily: '"Bebas Neue", Impact, sans-serif' }

type Mode = 'normal' | 'salary_cap'
type Tab = 'normal' | 'salary_cap' | 'personal'

const LB_STYLES = `
  .lb-mode-btn, .lb-era-btn {
    transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
  }
  .lb-era-btn:hover {
    transform: scale(1.06);
    border-color: #C9A84C !important;
    color: #C9A84C !important;
  }
  .lb-mode-btn:hover {
    transform: scale(1.04);
    border-color: #C9A84C !important;
    color: #C9A84C !important;
  }
  .lb-mode-btn.cap:hover {
    border-color: #9b6dff !important;
    color: #9b6dff !important;
  }
  .lb-mode-btn.personal:hover {
    border-color: #4caf78 !important;
    color: #4caf78 !important;
  }
  .lb-roster-panel {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.28s ease, opacity 0.22s ease;
  }
  .lb-roster-panel.open {
    max-height: 160px;
    opacity: 1;
  }
`

function RosterDisplay({ roster }: { roster: LeaderboardRoster }) {
  const starters = roster.starters ?? []
  const bench = roster.bench ?? []

  return (
    <div style={{ padding: '10px 14px 12px', fontSize: 11, color: G.greyDark, lineHeight: 1.9, borderTop: `1px solid ${G.border}` }}>
      {starters.length > 0 && (
        <div>
          <span style={{ color: G.gold, fontWeight: 700, letterSpacing: '0.1em', fontSize: 10 }}>STARTERS</span>
          {'  '}
          {starters.map((s, i) => (
            <span key={i}>
              <span style={{ color: '#666', fontWeight: 700 }}>{s.slot}</span>
              {' '}
              <span style={{ color: G.greyDark }}>{s.era} {s.name}</span>
              {i < starters.length - 1 && <span style={{ color: '#383838', margin: '0 8px' }}>|</span>}
            </span>
          ))}
        </div>
      )}
      {bench.length > 0 && (
        <div>
          <span style={{ color: G.gold, fontWeight: 700, letterSpacing: '0.1em', fontSize: 10 }}>BENCH</span>
          {'  '}
          {bench.map((b, i) => (
            <span key={i}>
              <span style={{ color: G.greyDark }}>{b.era} {b.name}</span>
              {i < bench.length - 1 && <span style={{ color: '#383838', margin: '0 8px' }}>·</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function getPersonalEntries(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem('eraball_personal_entries') ?? '[]')
  } catch {
    return []
  }
}

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('normal')
  const [era, setEra] = useState('20s')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setExpandedId(null)
    if (tab === 'personal') {
      const filtered = getPersonalEntries()
        .filter(e => e.era === era)
        .slice(0, 20)
      setEntries(filtered)
      return
    }
    setLoading(true)
    setEntries([])
    fetchLeaderboard(era, tab as Mode).then(data => {
      setEntries(data as LeaderboardEntry[])
      setLoading(false)
    })
  }, [era, tab])

  const isPersonal = tab === 'personal'

  const TAB_DEFS: { key: Tab; label: string; color: string; cls: string }[] = [
    { key: 'normal',     label: 'Normal Draft',      color: G.gold,   cls: 'lb-mode-btn' },
    { key: 'salary_cap', label: 'Salary Cap Draft',  color: G.purple, cls: 'lb-mode-btn cap' },
    { key: 'personal',   label: 'Personal',          color: G.green,  cls: 'lb-mode-btn personal' },
  ]

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}
      onClick={onClose}
    >
      <style>{LB_STYLES}</style>
      <div
        style={{ background: G.black, border: `1px solid ${G.border}`, width: '100%', maxWidth: 860, padding: '28px 24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ ...BEBAS, fontSize: 28, color: G.white, letterSpacing: '0.1em' }}>LEADERBOARD</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.greyDark, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {TAB_DEFS.map(({ key, label, color, cls }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cls}
              style={{
                padding: '8px 16px',
                border: `1px solid ${tab === key ? color : G.border}`,
                background: tab === key ? `${color}18` : 'transparent',
                color: tab === key ? color : G.greyDark,
                fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Era selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: isPersonal ? 12 : 20 }}>
          {ALL_ERAS.map(e => (
            <button
              key={e}
              onClick={() => setEra(e)}
              className="lb-era-btn"
              style={{
                padding: '6px 14px', border: `1px solid ${era === e ? G.gold : G.border}`,
                background: era === e ? `${G.gold}18` : 'transparent',
                color: era === e ? G.gold : G.greyDark,
                fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {eraLabel(e)}
            </button>
          ))}
        </div>

        {/* Personal hint */}
        {isPersonal && (
          <div style={{ fontSize: 11, color: '#444', marginBottom: 16, letterSpacing: '0.06em' }}>
            Your top 20 submitted runs for this era. Stored on this device.
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: G.greyDark, fontSize: 13, letterSpacing: '0.1em' }}>LOADING...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: G.greyDark, fontSize: 13, letterSpacing: '0.1em' }}>
            {isPersonal ? `No personal entries for ${eraLabel(era)} yet. Submit a run to see it here.` : `No entries yet for ${eraLabel(era)} ${tab === 'salary_cap' ? 'Salary Cap' : 'Normal Draft'}. Be the first!`}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ fontSize: 10, color: '#3a3a3a', marginBottom: 8, letterSpacing: '0.08em' }}>CLICK A ROW TO VIEW ROSTER</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                  {['#', 'TEAM', ...(isPersonal ? ['ERA', 'MODE'] : []), 'SCORE', 'REG W-L', 'PLAYOFF W-L', 'RESULT', 'PT DIFF', 'RATING', 'COACH'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === '#' || h === 'SCORE' || h === 'RATING' || h === 'PT DIFF' ? 'center' : 'left', color: G.greyDark, fontWeight: 700, letterSpacing: '0.1em', fontSize: 10, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isTop3 = i < 3
                  const rankColor = i === 0 ? G.gold : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : G.greyDark
                  const ptDiff = entry.avg_pt_diff
                  const rowId = entry.id ?? String(i)
                  const isExpanded = expandedId === rowId
                  const rowBg = i % 2 === 0 ? 'transparent' : G.surface
                  const hasRoster = !!(entry.roster && (entry.roster.starters?.length || entry.roster.bench?.length))
                  const colSpan = isPersonal ? 11 : 9
                  return (
                    <React.Fragment key={rowId}>
                      <tr
                        onClick={() => hasRoster && setExpandedId(isExpanded ? null : rowId)}
                        style={{ borderBottom: `1px solid ${G.border}`, background: rowBg, cursor: hasRoster ? 'pointer' : 'default' }}
                      >
                        <td style={{ padding: '10px', textAlign: 'center', ...BEBAS, fontSize: isTop3 ? 20 : 14, color: rankColor }}>{i + 1}</td>
                        <td style={{ padding: '10px', color: G.white, fontWeight: 700, fontSize: 13 }}>
                          {entry.team_name ?? '—'}
                          {hasRoster && (
                            <span style={{ color: '#444', fontSize: 9, marginLeft: 6, verticalAlign: 'middle', display: 'inline-block', transition: 'transform 0.25s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              ▼
                            </span>
                          )}
                        </td>
                        {isPersonal && (
                          <>
                            <td style={{ padding: '10px', color: G.gold, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{eraLabel(entry.era)}</td>
                            <td style={{ padding: '10px', color: entry.mode === 'salary_cap' ? G.purple : G.greyDark, fontSize: 10, whiteSpace: 'nowrap' }}>{entry.mode === 'salary_cap' ? 'CAP' : 'NORMAL'}</td>
                          </>
                        )}
                        <td style={{ padding: '10px', textAlign: 'center', ...BEBAS, fontSize: 18, color: G.gold }}>{Math.round(entry.score).toLocaleString()}</td>
                        <td style={{ padding: '10px', textAlign: 'left', color: G.greyDark }}>{entry.reg_wins}–{entry.reg_losses} <span style={{ color: '#555', fontSize: 10 }}>({(entry.reg_win_pct * 100).toFixed(0)}%)</span></td>
                        <td style={{ padding: '10px', textAlign: 'left', color: G.greyDark }}>{entry.playoff_wins}–{entry.playoff_losses}</td>
                        <td style={{ padding: '10px', color: entry.playoff_result === 'champion' ? G.gold : G.greyDark, fontWeight: entry.playoff_result === 'champion' ? 700 : 400, whiteSpace: 'nowrap' }}>
                          {entry.playoff_result ? PLAYOFF_LABEL[entry.playoff_result] ?? entry.playoff_result : '—'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: ptDiff > 0 ? G.green : ptDiff < 0 ? G.red : G.greyDark }}>
                          {ptDiff > 0 ? '+' : ''}{ptDiff.toFixed(1)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: G.greyDark }}>{entry.team_rating + 15}</td>
                        <td style={{ padding: '10px', color: G.greyDark, whiteSpace: 'nowrap', fontSize: 11 }}>
                          {entry.coach_name ? `${entry.coach_name.replace('*', '')} (${entry.coach_grade})` : '—'}
                        </td>
                      </tr>
                      {hasRoster && entry.roster && (
                        <tr style={{ borderBottom: `1px solid ${G.border}`, background: rowBg }}>
                          <td colSpan={colSpan} style={{ padding: 0 }}>
                            <div className={`lb-roster-panel${isExpanded ? ' open' : ''}`}>
                              <RosterDisplay roster={entry.roster} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
