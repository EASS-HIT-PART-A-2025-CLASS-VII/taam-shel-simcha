import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// ✅ הגדרה מעודכנת שמכילה גם את setupFiles ל־Vitest
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: '/',
  optimizeDeps: {
    include: [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',  // ✅ זה הקובץ שהוספנו
  },
});
