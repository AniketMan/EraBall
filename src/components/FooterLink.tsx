// src/components/FooterLink.tsx
// Shared dumb external footer link. Pure presentational anchor with configurable
// color/border/opacity. Markup and styling identical to the original page.tsx version.

import React from 'react';
import { G } from './tokens';

export interface FooterLinkProps {
  href: string;
  label: string;
  color: string;
  border: string;
  opacity: number;
}

export function FooterLink({ href, label, color, border, opacity }: FooterLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        color, border: `1px solid ${border}`, padding: '6px 12px',
        background: G.surface, textDecoration: 'none', opacity,
        cursor: 'pointer', display: 'block',
      }}
    >
      {label}
    </a>
  );
}

export default FooterLink;
