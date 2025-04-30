// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Comment this out for local development
  base: '/SudokuLight/',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // Rename the main output JS file to bundle.js to match the service worker config
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'chunk-[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  
  // Server configuration
  server: {
    host: true,
    port: 5173
  }
}); 