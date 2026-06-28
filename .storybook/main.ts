// .storybook/main.ts
// Storybook config for the EraBall shared component library.
//
// Deliberately uses the React + Vite builder, fully decoupled from the app's Next 16 /
// Turbopack build. The shared components are framework-agnostic React, so they render
// identically here. Tailwind v4 is wired via @tailwindcss/vite so the same utility
// classes and the app's globals.css behave the same as in the app.

import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(cfg) {
    return mergeConfig(cfg, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          // Mirror the tsconfig path aliases so stories can import shared deps if needed.
          '@eraball/engine': path.resolve(__dirname, '../packages/engine/src/index.ts'),
          '@': path.resolve(__dirname, '..'),
        },
      },
    });
  },
};

export default config;
