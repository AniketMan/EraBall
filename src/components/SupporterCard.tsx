// src/components/SupporterCard.tsx
// Shared dumb supporter chip with a hover scale/border effect and an animated sheen beam
// (the .card-sheen-beam class lives in app/globals.css). Pure presentational. Markup,
// hover handlers, and styling identical to the original page.tsx version.

import React, { useRef } from 'react';
import { G } from './tokens';

export interface SupporterCardProps {
  name: string;
}

export function SupporterCard({ name }: SupporterCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        ref.current.style.transform = 'scale(1.03)';
        ref.current.style.borderColor = G.goldDim;
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.transform = 'scale(1)';
        ref.current.style.borderColor = G.border;
      }}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', background: G.black,
        border: `1px solid ${G.border}`,
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div className="card-sheen-beam" />
      <span style={{ color: G.gold, fontSize: 14 }}>{'\u2605'}</span>
      <span style={{ fontSize: 13, color: G.white, letterSpacing: '0.04em' }}>{name}</span>
    </div>
  );
}

export default SupporterCard;
