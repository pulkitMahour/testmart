import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client talks to the API at /api and Vite proxies it to the NestJS server,
// so the browser sees a single origin (httpOnly auth cookies work without CORS pain).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
