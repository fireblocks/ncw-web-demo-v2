import { PasswordEncryptedLocalStorage } from './PasswordEncryptedLocalStorage';

export const secureStorageProviderFactory = (deviceId: string) =>
  new PasswordEncryptedLocalStorage(deviceId, () => {
    const password = prompt('Enter password', '');
    return Promise.resolve(password || '');
  });
