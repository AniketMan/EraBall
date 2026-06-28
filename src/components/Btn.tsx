// src/components/Btn.tsx
// Shared dumb button. Pure props -> JSX, no side effects. Relies on the global
// .btn-gold / .btn-outline / .btn-ghost classes defined in app/globals.css for hover
// states; the inline styles set the base color/border per variant. Behavior and markup
// are identical to the original page.tsx definition.

import React from 'react';
import { G } from './tokens';

export type BtnVariant = 'gold' | 'outline' | 'ghost';

export interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: BtnVariant;
  className?: string;
  style?: React.CSSProperties;
}

export function Btn({ children, onClick, disabled, variant = 'gold', className = '', style }: BtnProps) {
  const base = 'px-6 py-3 text-sm uppercase tracking-[0.15em] font-semibold active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed';
  const styles: Record<string, React.CSSProperties> = {
    gold:    { background: G.gold, color: G.black, border: 'none' },
    outline: { background: 'transparent', color: G.gold, border: `1px solid ${G.gold}` },
    ghost:   { background: 'transparent', color: G.grey, border: `1px solid ${G.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} btn-${variant} ${className}`} style={{ ...styles[variant], ...style }}>
      {children}
    </button>
  );
}

export default Btn;
