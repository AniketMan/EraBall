// src/components/PlayerHeadshot.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PlayerHeadshot } from './PlayerHeadshot';

const meta: Meta<typeof PlayerHeadshot> = {
  title: 'Atoms/PlayerHeadshot',
  component: PlayerHeadshot,
  args: { personId: '2544', size: 64, initial: 'L' },
  argTypes: {
    size: { control: { type: 'range', min: 24, max: 160, step: 4 } },
  },
  parameters: {
    docs: {
      description: {
        component: 'Hotlinks the NBA CDN headshot. On load error it renders the slot-initial fallback circle. The `personId` 0 below forces the fallback (no such image).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PlayerHeadshot>;

// 2544 = LeBron James personId on the NBA CDN (live image).
export const Live: Story = { args: { personId: '2544', size: 80, initial: 'L' } };

// An invalid id forces the onError fallback path.
export const Fallback: Story = { args: { personId: '0', size: 80, initial: 'X' } };

export const SizeRange: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <PlayerHeadshot personId="0" size={32} initial="A" />
      <PlayerHeadshot personId="0" size={48} initial="B" />
      <PlayerHeadshot personId="0" size={64} initial="C" />
      <PlayerHeadshot personId="0" size={96} initial="D" />
    </div>
  ),
};
