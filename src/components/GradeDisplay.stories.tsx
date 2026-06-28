// src/components/GradeDisplay.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GradeDisplay } from './GradeDisplay';

const meta: Meta<typeof GradeDisplay> = {
  title: 'Atoms/GradeDisplay',
  component: GradeDisplay,
  args: { grade: 'A', label: 'Coach Grade' },
};
export default meta;

type Story = StoryObj<typeof GradeDisplay>;

export const GradeA: Story = { args: { grade: 'A', label: 'Elite' } };
export const GradeB: Story = { args: { grade: 'B', label: 'Solid' } };
export const GradeC: Story = { args: { grade: 'C', label: 'Average' } };
export const GradeF: Story = { args: { grade: 'F', label: 'Poor' } };

export const AllGrades: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gap: 12 }}>
      <GradeDisplay grade="A" label="Elite" />
      <GradeDisplay grade="B" label="Solid" />
      <GradeDisplay grade="C" label="Average" />
      <GradeDisplay grade="F" label="Poor" />
    </div>
  ),
};
