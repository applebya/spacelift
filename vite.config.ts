import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

import { preloadCritical } from './tools/vite-plugin-preload-critical.ts'
// Same constant the rendered <img> uses. The preload's `imagesizes` and the
// element's `sizes` have to be identical, or the browser preloads one candidate
// and then requests a different one.
import { SIZES } from './src/sizes.ts'

// https://vite.dev/config https://vitest.dev/config
export default defineConfig({
  base: '/',
  resolve: {
    // Native replacement for vite-tsconfig-paths: honours the `baseUrl: ./src`
    // in tsconfig.json so `components/...`, `images` and `sizes` resolve.
    tsconfigPaths: true
  },
  plugins: [
    react(),
    imagetools(),
    preloadCritical({
      lcpImage: 'hero-1',
      lcpSizes: SIZES.hero,
      fonts: ['besley-latin-variable', 'lato-latin-400']
    })
  ],
  build: {
    // Every asset filename is content-hashed, so these can be served with a
    // long immutable cache. See docs/hosting-architecture-decision.md.
    assetsInlineLimit: 2048
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: '.vitest/setup',
    include: ['src/**/*.test.{ts,tsx}']
  }
})
