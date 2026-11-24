import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The package is symlinked from "..", which has its own copy of React for tests.
  // Dedupe so the app and the hook share one React instance.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5174 },
})
