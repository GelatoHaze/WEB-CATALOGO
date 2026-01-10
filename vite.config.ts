
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo (development/production)
  // Fix: Cast process to any to resolve TS error 'Property cwd does not exist on type Process'
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: '/', // Asegura rutas relativas correctas en Vercel
    // En Vite, las variables que empiezan con VITE_ se exponen automáticamente en import.meta.env
    // No necesitamos 'define' manual para process.env si usamos el estándar de Vite.
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // Sourcemaps solo en dev para ahorrar peso
      minify: 'esbuild',
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            icons: ['lucide-react'],
            utils: ['./services/store'],
            genai: ['@google/genai']
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
