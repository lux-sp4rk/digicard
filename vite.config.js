import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteImagemin from 'vite-plugin-imagemin';

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    globals: true,
  },
  plugins: [
    react(),
    viteImagemin({
      pngquant: {
        quality: [0.6, 0.8],
        speed: 4,
      },
      mozjpeg: {
        quality: 85,
      },
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    host: true, // Allows access from network (not just localhost)
    allowedHosts: true, // Allow all hosts (for cloudflare tunnels, ngrok, etc)
    proxy: {
      '/api': {
        target: 'https://api.beehiiv.com/v2',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
