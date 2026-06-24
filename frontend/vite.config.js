import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
    // Inline small assets directly — saves extra HTTP requests
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        // Split vendor libs into separate cached chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom'))      return 'vendor-react';
            if (id.includes('react-router'))   return 'vendor-router';
            if (id.includes('framer-motion'))  return 'vendor-framer';
            if (id.includes('axios'))          return 'vendor-axios';
            return 'vendor-misc';
          }
        }
      }
    }
  },
  // Pre-bundle deps for faster dev cold start
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
});
