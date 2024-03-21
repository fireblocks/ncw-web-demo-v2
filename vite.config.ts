import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths(), splitVendorChunkPlugin()],
  base: "/ncw-web-demo/",
  server: {
    open: true,
    host: 'localhost',
    hmr: true,
  },
  publicDir: './public',
  build: {
    outDir: './dist',
  },
  optimizeDeps: {
    exclude: ['@fireblocks/ncw-js-sdk', 'tsl-apple-cloudkit'],
  },
});
