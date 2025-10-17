import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // ✅ AÑADE ESTE BLOQUE COMPLETO
  server: {
    proxy: {
      // Cualquier petición que empiece con '/api'
      '/api': {
        // Será redirigida a tu servidor de backend
        target: 'http://localhost:3000', // <-- ¡Verifica que este es el puerto de tu backend!

        // Necesario para que el backend acepte la petición
        changeOrigin: true, 
      },
    },
  },
});