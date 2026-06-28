// src/components/SupporterCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SupporterCard } from './SupporterCard';

const meta: Meta<typeof SupporterCard> = {
  title: 'Atoms/SupporterCard',
  component: SupporterCard,
  args: { name: 'Klass' },
  parameters: {
    docs: {
      description: {
        component: 'Hover to see the scale/border lift. The animated sheen beam uses the .card-sheen-beam class from app/globals.css.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <SupporterCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof SupporterCard>;

export const Default: Story = {};

export const List: Story = {
  render: () => (
    <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SupporterCard name="Klass" />
      <SupporterCard name="Klass's Friend" />
      <SupporterCard name="TheZDSpecial" />
      <SupporterCard name="RM" />
      <SupporterCard name="David" />
    </div>
  ),
};
