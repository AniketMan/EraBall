// src/components/TagTooltip.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TagTooltip } from './TagTooltip';

const meta: Meta<typeof TagTooltip> = {
  title: 'Atoms/TagTooltip',
  component: TagTooltip,
  parameters: {
    docs: {
      description: {
        component: 'Hover the trigger to see the portal-rendered tooltip. The tip is positioned to the upper-left of the trigger element.',
      },
    },
  },
  args: {
    tip: 'This player fits the selected era and position.',
  },
  render: (args) => (
    <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}>
      <TagTooltip {...args}>
        <span style={{ color: '#C9A84C', cursor: 'help', borderBottom: '1px dotted #7A6430' }}>
          Hover me
        </span>
      </TagTooltip>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof TagTooltip>;

export const Default: Story = {};
export const LongTip: Story = {
  args: { tip: 'Timeless tag: this player performs at an elite level across every era, with no era modifier penalty applied to their base rating.' },
};
