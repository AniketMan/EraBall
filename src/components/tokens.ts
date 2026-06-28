// src/components/tokens.ts
// Canonical design tokens for the shared dumb component library.
//
// These values are lifted verbatim from app/page.tsx. The `G` palette is identical
// everywhere it is used in the app, so centralizing it here is safe and removes
// duplication. The BEBAS font object uses the page.tsx variant (CSS variable form);
// other files (ResultCard, modals) keep their own local font strings unchanged because
// those strings differ slightly and unifying them could alter rendering. Tokens here are
// the contract for the SHARED components only.

export const G = {
  gold:     '#C9A84C',
  goldHov:  '#E2C46A',
  goldDim:  '#7A6430',
  black:    '#000000',
  surface:  '#111111',
  surface2: '#1A1A1A',
  border:   '#222222',
  borderSub:'#1A1A1A',
  white:    '#FFFFFF',
  grey:     '#888888',
  greyDark: '#aaaaaa',
  red:      '#CC3333',
} as const;

// Bebas display font as an inline-style object (page.tsx form, via the --font-bebas
// CSS variable defined in app/layout.tsx).
export const BEBAS = { fontFamily: 'var(--font-bebas), "Bebas Neue", impact, sans-serif' } as const;
