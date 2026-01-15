import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/runner.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  exports: true,
})
