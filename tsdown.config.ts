import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/runner.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
})
