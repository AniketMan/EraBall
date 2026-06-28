// src/components/Btn.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Btn } from './Btn';

const meta: Meta<typeof Btn> = {
  title: 'Atoms/Btn',
  component: Btn,
  args: {
    children: 'Start Draft',
    variant: 'gold',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['gold', 'outline', 'ghost'] },
    onClick: { action: 'clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof Btn>;

export const Gold: Story = { args: { variant: 'gold', children: 'Gold Button' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Outline Button' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost Button' } };
export const Disabled: Story = { args: { variant: 'gold', children: 'Disabled', disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Btn variant="gold">Gold</Btn>
      <Btn variant="outline">Outline</Btn>
      <Btn variant="ghost">Ghost</Btn>
      <Btn variant="gold" disabled>Disabled</Btn>
    </div>
  ),
};
