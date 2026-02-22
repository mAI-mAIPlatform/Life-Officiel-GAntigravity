import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ⚡ crucial pour que les chemins relatifs marchent sur Pages
  server: {
    port: 1000,
    strictPort: false
  }
});
