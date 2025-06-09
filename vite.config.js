// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Permite que Vite sea accesible desde cualquier host
    host: '0.0.0.0', 
    
    // Le decimos a Vite que confíe en las peticiones que vienen del dominio de ngrok
    hmr: {
      clientPort: 443 // Puerto estándar para HTTPS
    },
    
    // --- AQUÍ ESTÁ LA SOLUCIÓN PRINCIPAL ---
    // Añadimos el dominio de ngrok a la lista de hosts permitidos.
    // El punto al principio actúa como un comodín (wildcard).
    allowedHosts: ['.ngrok-free.app']
  }
})