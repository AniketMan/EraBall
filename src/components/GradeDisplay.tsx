// src/components/GradeDisplay.tsx
// Shared dumb grade tile: large letter grade with a caption, color-coded by grade.
// Pure presentational. Logic and styling identical to the original page.tsx definition.

import React from 'react';
import { G, BEBAS } from './tokens';

export interface GradeDisplayProps {
  grade: string;
  label: string;
}

export function GradeDisplay({ grade, label }: GradeDisplayProps) {
  const gradeGold = grade === 'A';
  const gradeWhite = grade === 'B';
  const gradeRed = grade === 'F';
  const color = gradeGold ? G.gold : gradeWhite ? G.white : gradeRed ? G.red : G.grey;
  return (
    <div className="text-center py-4" style={{ background: G.surface2, border: `1px solid ${G.border}` }}>
      <div className="text-5xl" style={{ ...BEBAS, color }}>{grade}</div>
      <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: G.grey }}>{label}</div>
    </div>
  );
}

export default GradeDisplay;
