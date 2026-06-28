// src/components/FooterButton.tsx
// Shared dumb footer action: anchor styled as a button, keyboard-activatable. Pure
// presentational. Markup and styling identical to the original page.tsx version.

import React from 'react';
import { G } from './tokens';

export interface FooterButtonProps {
  label: string;
  onClick: () => void;
}

export function FooterButton({ label, onClick }: FooterButtonProps) {
  return (
    <a
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: G.gold,
        border: `1px solid ${G.goldDim}`,
        padding: '6px 12px',
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
