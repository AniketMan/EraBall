// src/components/FooterButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FooterButton } from './FooterButton';

const meta: Meta<typeof FooterButton> = {
  title: 'Atoms/FooterButton',
  component: FooterButton,
  args: { label: 'How to Play' },
  argTypes: { onClick: { action: 'clicked' } },
};
export default meta;

type Story = StoryObj<typeof FooterButton>;

export const Default: Story = {};
export const Supporters: Story = { args: { label: 'Supporters' } };
