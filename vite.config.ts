import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    outDir: './build',
    lib: {
      entry: './src/index.ts',
      name: 'react-dead-simple-stopwatch-hook',
      fileName: 'index'
    },
    rollupOptions: {
      preserveEntrySignatures: "strict",
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      },
      plugins: [
        // peerDepsExternal(),
        react({
          jsxRuntime: 'classic'
        }),
      ]
    }
  }
})
