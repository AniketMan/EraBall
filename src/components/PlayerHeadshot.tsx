// src/components/PlayerHeadshot.tsx
// Shared dumb player headshot: hotlinks the NBA CDN image directly and falls back to a
// slot-initial placeholder on load error. This is a pure render concern (no service /
// no proxy) -- the live UI intentionally uses the direct CDN URL. Markup and styling are
// identical to the original page.tsx definition.
//
// Note: the original prop signature includes an unused `lazy?: boolean`. It is preserved
// here so existing call sites compile unchanged; it has no effect, matching the original.

import React, { useState } from 'react';
import { G } from './tokens';

export interface PlayerHeadshotProps {
  personId: string;
  size: number;
  initial?: string;
  lazy?: boolean;
}

export function PlayerHeadshot({ personId, size, initial }: PlayerHeadshotProps) {
  const [failed, setFailed] = useState(false);
  const wrap: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    border: `1px solid ${G.goldDim}`,
    background: G.surface2,
    overflow: 'hidden',
    position: 'relative',
  };
  if (failed) {
    return (
      <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: G.greyDark, fontSize: size * 0.35, fontWeight: 700 }}>{initial ?? '?'}</span>
      </div>
    );
  }
  return (
    <div style={wrap}>
      <img
        src={`https://cdn.nba.com/headshots/nba/latest/260x190/${personId}.png`}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{
          position: 'absolute',
          height: '100%',
          width: 'auto',
          maxWidth: 'none',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

export default PlayerHeadshot;
