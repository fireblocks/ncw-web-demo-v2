import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// Read the environment variable (Vite automatically loads env variables prefixed with VITE_)
const useEmbeddedWalletSDK = process.env.VITE_USE_EMBEDDED_WALLET_SDK === 'true';

// Determine the correct API path
const apiPath = useEmbeddedWalletSDK
  ? resolve(__dirname, './src/api-embedded-wallet')
  : resolve(__dirname, './src/api');


export default defineConfig({
  base: '/ncw-web-demo-v2/',
  plugins: [react(), svgr(), tsconfigPaths(), splitVendorChunkPlugin()],
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
  resolve: {
    alias: {
      '@api': apiPath,
    },
  },
});
