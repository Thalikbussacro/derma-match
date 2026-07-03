import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em dev, encaminha /api para o backend (same-site: cookies e CORS triviais).
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  preview: {
    // Serve o build (dist) na mesma porta do dev, com o mesmo proxy — mantém o same-site
    // dos cookies e a origem já liberada no CORS do backend.
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
