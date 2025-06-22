/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTOMATE_INITIALIZATION?: string;

  readonly VITE_CLOUDKIT_APITOKEN: string;
  readonly VITE_CLOUDKIT_CONTAINER_ID: string;
  readonly VITE_CLOUDKIT_ENV: 'development' | 'production';

  readonly VITE_NCW_SDK_ENV: string;
  readonly VITE_USE_EMBEDDED_WALLET_SDK: string;
  readonly VITE_BASE_FOLDER: string;
  readonly VITE_BACKEND_BASE_URL: string;
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_USE_WEB_PUSH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
