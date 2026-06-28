'use client'
// app/_shared/CoachHeadshot.tsx
// Shared view atom: renders a coach's circular headshot, fetched through the headshots
// anti-corruption service. Service-coupled (not a generic dumb component), so it lives in
// the app-private _shared module rather than the Storybook component library.

import React, { useState, useEffect } from 'react'
import { getCoachHeadshot } from '../../services/headshots'
import { G } from '../../src/components/tokens'

export function CoachHeadshot({ name, size }: { name: string; size: number }) {
  const [failed, setFailed] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    // getCoachHeadshot resolves to an objectURL on success or null on failure (it never
    // throws). Map null -> failed so the initial-letter placeholder shows, preserving the
    // original load-empty-circle vs failed-placeholder distinction.
    getCoachHeadshot(name)
      .then(url => { if (url) setSrc(url); else setFailed(true) })
      .catch(() => setFailed(true))
  }, [name])
  const base: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    border: `1px solid ${G.goldDim}`, background: G.surface2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  if (failed) {
    return (
      <div style={base}>
        <span style={{ color: G.greyDark, fontSize: size * 0.35, fontWeight: 700 }}>{name[0]}</span>
      </div>
    )
  }
  if (!src) return <div style={{ ...base, border: `1px solid ${G.goldDim}` }} />
  return (
    <img
      src={src}
      alt=""
      style={{ ...base, objectFit: 'cover', objectPosition: 'center top', transform: 'translateZ(0)' }}
    />
  )
}
