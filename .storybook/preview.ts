// .storybook/preview.ts
// Global Storybook parameters + decorators for the shared component library.

import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'eraball-black',
      values: [
        { name: 'eraball-black', value: '#000000' },
        { name: 'surface', value: '#111111' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
