import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // Exponer en la red local
    port: 5173, // Asegurar el puerto
    strictPort: true, // No cambiar de puerto automáticamente
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Dirección del backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

