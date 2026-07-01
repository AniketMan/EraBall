// src/components/FooterButton.tsx
// Shared dumb footer action: anchor styled as a button, keyboard-activatable. Pure
// presentational. Markup and styling identical to the original page.tsx version.

import React from 'react';
import { G } from './tokens';

export interface FooterButtonProps {
  label: string;
  onClick: () => void;
  // Optional passthroughs added in v1.5.5 so callers can apply an animated glow
  // (className="hof-btn") and tune sizing without forking the component.
  className?: string;
  fontSize?: number;
  padding?: string;
}

export function FooterButton({ label, onClick, className, fontSize = 11, padding = '6px 12px' }: FooterButtonProps) {
  return (
    <a
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={className}
      style={{
        fontSize, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: G.gold,
        border: `1px solid ${G.goldDim}`,
        padding,
        background: G.surface,
        textDecoration: 'none',
        opacity: 0.85,
        cursor: 'pointer',
        display: 'block',
      }}
    >
      {label}
    </a>
  );
}

export default FooterButton;
