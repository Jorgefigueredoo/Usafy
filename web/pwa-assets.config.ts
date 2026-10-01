import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

import { colors } from './src/theme/colors.ts';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: colors.background },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: colors.background },
    },
  },
  images: ['public/logo.svg'],
});
