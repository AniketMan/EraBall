// src/components/index.ts
//
// Barrel for the shared, presentational ("dumb") component library. These components
// are pure: props in, JSX out. They perform no engine calls, no network I/O, and no
// data fetching, which makes them safe to catalog in Storybook and reuse across apps.
//
// Consumers (app/page.tsx, future apps) import from this single module rather than
// reaching into individual files. Design tokens are re-exported too so callers can use
// the shared palette without a second import path.

export { Btn } from './Btn';
export type { BtnProps, BtnVariant } from './Btn';

export { GoldLabel } from './GoldLabel';
export type { GoldLabelProps } from './GoldLabel';

export { GradeDisplay } from './GradeDisplay';
export type { GradeDisplayProps } from './GradeDisplay';

export { TagTooltip } from './TagTooltip';
export type { TagTooltipProps } from './TagTooltip';

export { PlayerHeadshot } from './PlayerHeadshot';
export type { PlayerHeadshotProps } from './PlayerHeadshot';

export { FooterLink } from './FooterLink';
export type { FooterLinkProps } from './FooterLink';

export { FooterButton } from './FooterButton';
export type { FooterButtonProps } from './FooterButton';

export { SupporterCard } from './SupporterCard';
export type { SupporterCardProps } from './SupporterCard';

// Shared design tokens (gold palette + Bebas font object).
export { G, BEBAS } from './tokens';
