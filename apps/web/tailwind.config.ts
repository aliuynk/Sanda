import sharedPreset from '@sanda/config-tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [sharedPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui-web/src/**/*.{ts,tsx}',
  ],
};

export default config;
