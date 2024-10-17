import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  treeshake: true,
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  outExtension: () => {
    return {
      js: '.js',
      dts: '.d.ts',
    }
  },
})
