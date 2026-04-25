import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import preset from '@synergy/config/tailwind/preset';

const config: Config = {
  presets: [preset as Config],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  plugins: [animate],
};

export default config;
