import { defineConfig } from 'tsup'
import { execSync } from 'child_process'

export default defineConfig({
  entry: ['src/index.ts', 'src/templates/**/*.{ts,tsx}'],
  format: ['esm'],
  splitting: false,
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
  onSuccess: async () => {
    console.log('Running schema validation...')
    try {
      // Run the CommonJS script with Node.js
      execSync('node ./scripts/validate-schemas.js', { stdio: 'inherit' })
      // TODO: add validate duplicate template id & id matching filename
    } catch (error) {
      console.error('Error during validation:', error)
      process.exit(1) // Exit with error code if validation fails
    }
  },
})
