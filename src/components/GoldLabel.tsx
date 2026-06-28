// src/components/GoldLabel.tsx
// Shared dumb label: small uppercase tracked caption. Pure presentational.

import React from 'react';
import { G } from './tokens';

export interface GoldLabelProps {
  children: React.ReactNode;
}

export function GoldLabel({ children }: GoldLabelProps) {
  return (
    <div className="text-xs uppercase tracking-[0.2em]" style={{ color: G.grey }}>
      {children}
    </div>
  );
}

export default GoldLabel;
