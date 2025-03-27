import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: `./out`,
  },
  base: "/MessageApp/",
  server: {
    allowedHosts: [
      'daveweb.zapto.org',  // Add your host here
      'localhost',          // Optional: Allow localhost as well
      '127.0.0.1',          // Optional: Allow local IP address
    ],
  },
})
