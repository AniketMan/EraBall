// src/components/FooterLink.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FooterLink } from './FooterLink';
import { G } from './tokens';

const meta: Meta<typeof FooterLink> = {
  title: 'Atoms/FooterLink',
  component: FooterLink,
  args: {
    href: 'https://ko-fi.com/eshanb',
    label: 'Support the game',
    color: G.gold,
    border: G.goldDim,
    opacity: 0.85,
  },
};
export default meta;

type Story = StoryObj<typeof FooterLink>;

export const Gold: Story = {};
export const Muted: Story = {
  args: { label: 'Privacy', color: G.grey, border: G.border, opacity: 0.6 },
};
