import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// Load env file manually for vite config
dotenv.config();

// Now you can debug
console.log('VITE_USE_EMBEDDED_WALLET_SDK:', process.env.VITE_USE_EMBEDDED_WALLET_SDK);

// Read the environment variable (Vite automatically loads env variables prefixed with VITE_)
const useEmbeddedWalletSDK = process.env.VITE_USE_EMBEDDED_WALLET_SDK === 'true';

// Determine the correct API path
const apiPath = useEmbeddedWalletSDK
  ? resolve(__dirname, './src/api-embedded-wallet')
  : resolve(__dirname, './src/api');

export default defineConfig({
  base: process.env.VITE_BASE_FOLDER,
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
      '@services': resolve(__dirname, './src/services'),
    },
  },
});
