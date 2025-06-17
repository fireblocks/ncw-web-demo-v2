export const ENV_CONFIG = {
  AUTOMATE_INITIALIZATION: import.meta.env.VITE_AUTOMATE_INITIALIZATION === 'true',
  DEV_MODE: import.meta.env.DEV,

  CLOUDKIT_APITOKEN: import.meta.env.VITE_CLOUDKIT_APITOKEN,
  CLOUDKIT_CONTAINER_ID: import.meta.env.VITE_CLOUDKIT_CONTAINER_ID,
  CLOUDKIT_ENV: import.meta.env.VITE_CLOUDKIT_ENV,

  NCW_SDK_ENV: import.meta.env.VITE_NCW_SDK_ENV ?? 'sandbox',
  USE_EMBEDDED_WALLET_SDK: import.meta.env.VITE_USE_EMBEDDED_WALLET_SDK === 'true',
  BASE_FOLDER: import.meta.env.VITE_BASE_FOLDER,
  BACKEND_BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL,
  AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  USE_WEB_PUSH: import.meta.env.VITE_USE_WEB_PUSH === 'true',
};
