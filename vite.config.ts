
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensures correct asset paths on Vercel
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020', // CHANGED: esnext -> es2020 for better mobile compatibility
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
          utils: ['./services/store'] // Chunking logic
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true // Expose to network for testing on real mobile devices
  }
});
