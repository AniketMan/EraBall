'use client'
// app/_shared/SupportersModal.tsx
// Shared modal: lists project supporters (Ko-fi). Uses the SupporterCard atom from the
// Storybook component library. The supporter name list lives here as static data.

import React from 'react'
import { G, BEBAS } from '../../src/components/tokens'
import { SupporterCard } from '../../src/components'

export const SUPPORTERS = [
  'Klass',
  "Klass's Friend",
  'TheZDSpecial',
  'RM',
  'David',
]

export function SupportersModal({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.surface, border: `1px solid ${G.border}`, width: '100%', maxWidth: 340, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...BEBAS, fontSize: 22, color: G.gold, letterSpacing: '0.2em' }}>Thank You!</div>
            <div style={{ fontSize: 11, color: G.grey, marginTop: 2 }}>These supporters are keeping EraBall alive!</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.grey, fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>✕</button>
        </div>
        <div style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SUPPORTERS.map(name => <SupporterCard key={name} name={name} />)}
          <a
            href="https://ko-fi.com/eshanb"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'none', border: `1px solid ${G.border}`, color: G.greyDark, fontSize: 10, letterSpacing: '0.08em', textDecoration: 'none', cursor: 'pointer', alignSelf: 'center' }}
          >
            <span style={{ color: G.goldDim }}>Support on Ko-fi</span>
            <span>· donate to be here</span>
          </a>
        </div>
      </div>
    </div>
  )
}
