'use client'
// app/_shared/TopBar.tsx
// Shared header bar: ERA BALL logo (restart), How-to-Play trigger, and an optional right
// slot. Owns the How-to-Play modal open/close state locally.

import React, { useState } from 'react'
import { G, BEBAS } from '../../src/components/tokens'
import { HowToPlayModal } from './HowToPlayModal'

export function TopBar({ onRestart, right }: { onRestart: () => void; right?: React.ReactNode }) {
  const [showHelp, setShowHelp] = useState(false)
  return (
    <>
      <div style={{ borderBottom: `1px solid ${G.border}`, background: G.surface }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2" style={{ minWidth: 0 }}>
          <button onClick={onRestart} className="logo-btn" style={{ ...BEBAS, fontSize: 22, letterSpacing: '0.3em', color: G.gold, cursor: 'pointer', background: 'none', border: 'none', padding: 0, flexShrink: 0 }}>
            ERA BALL
          </button>
          <div className="flex items-center gap-2 sm:gap-4" style={{ minWidth: 0 }}>
            <button
              onClick={() => setShowHelp(true)}
              className="text-xs uppercase tracking-widest"
              style={{ background: 'none', border: `1px solid ${G.border}`, color: G.grey, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.2em', transition: 'color 0.12s ease, border-color 0.12s ease', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = G.gold; e.currentTarget.style.borderColor = G.gold }}
              onMouseLeave={e => { e.currentTarget.style.color = G.grey; e.currentTarget.style.borderColor = G.border }}
              title="How to Play"
            >
              <span className="hidden sm:inline">How to Play</span>
              <span className="sm:hidden" style={{ fontSize: 14, lineHeight: 1 }}>?</span>
            </button>
            <div className="text-xs uppercase tracking-widest" style={{ color: G.grey, minWidth: 0 }}>
              {right ?? <span className="hidden sm:inline">Basketball Draft Simulator</span>}
            </div>
          </div>
        </div>
      </div>
      {showHelp && <HowToPlayModal onClose={() => setShowHelp(false)} />}
    </>
  )
}
