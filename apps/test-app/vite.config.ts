import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    watch: {
      ignored: ['!**/node_modules/maui-core/**'], // Make sure Vite watches changes in maui-core
    },
  },
});
