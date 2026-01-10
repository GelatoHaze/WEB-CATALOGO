import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: '/', // Ensures correct asset paths on Vercel
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020', // Optimizes for modern browsers/mobiles
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            icons: ['lucide-react'],
            utils: ['./services/store'], // Chunking logic
            genai: ['@google/genai']
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true // Expose to network for testing on real mobile devices
    }
  };
});