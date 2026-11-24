/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { copyFileSync } from 'node:fs'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      rollupTypes: true,
      // CommonJS consumers need a .d.cts next to the .cjs build.
      afterBuild: () => copyFileSync('build/index.d.ts', 'build/index.d.cts'),
    }),
  ],
  build: {
    outDir: './build',
    lib: {
      entry: './src/index.ts',
      name: 'ReactDeadSimpleStopwatchHook',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      },
    }
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.*'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
