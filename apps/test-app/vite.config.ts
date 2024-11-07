import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Conditionally add visualizer plugin if ANALYZE_BUNDLE is set
  const rollupPlugins = process.env.ANALYZE_BUNDLE
    ? [
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          template: 'treemap',
          gzipSize: true,
        }),
      ]
    : []

  return {
    plugins: [preact()],
    build: {
      rollupOptions: {
        plugins: rollupPlugins, // Ensures this is always an array
      },
    },
    server: {
      watch: {
        ignored: ['!**/node_modules/maui-core/**'], // Ensure Vite watches changes in maui-core
      },
    },
    resolve: {
      alias: {
        '@mui/material': '@mui/material',
        '@emotion/react': '@emotion/react',
        '@emotion/styled': '@emotion/styled',
      },
    },
    optimizeDeps: {
      include: ['@mui/material', '@emotion/react', '@emotion/styled'],
    },
  }
})
