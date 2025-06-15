import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // ✅ חשוב: זה מאפשר לנווט ישירות לנתיבים כמו /reset-password
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // זה החלק הקריטי:
  base: '/',
  // זה מה שמאפשר ל-Vite להחזיר תמיד index.html עבור כל route
  // כדי ש-react-router יטפל בניווט
  // אם זה חסר – תוסיף:
  optimizeDeps: {
    include: [],
  },
});
