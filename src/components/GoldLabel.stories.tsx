// src/components/GoldLabel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GoldLabel } from './GoldLabel';

const meta: Meta<typeof GoldLabel> = {
  title: 'Atoms/GoldLabel',
  component: GoldLabel,
  args: { children: 'Team Rating' },
};
export default meta;

type Story = StoryObj<typeof GoldLabel>;

export const Default: Story = {};
export const LongText: Story = { args: { children: 'Regular Season Win Percentage' } };
