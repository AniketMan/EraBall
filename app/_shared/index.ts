// app/_shared/index.ts
// Barrel for shared app-level UI: game-specific view atoms and modals that are reused
// across multiple feature screens. These are distinct from the generic, Storybook-cataloged
// component library in src/components (which is framework-agnostic and prop-only).

export { CoachHeadshot } from './CoachHeadshot'
export { PlayerCard } from './PlayerCard'
export { CourtSlotView } from './CourtSlotView'
export { HowToPlayModal } from './HowToPlayModal'
export { SupportersModal, SUPPORTERS } from './SupportersModal'
export { TopBar } from './TopBar'
export { PatchNotesModal } from './PatchNotesModal'
