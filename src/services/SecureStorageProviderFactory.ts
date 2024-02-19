import { PasswordEncryptedLocalStorage } from './PasswordEncryptedLocalStorage';

export const secureStorageProviderFactory = (deviceId: string) =>
  new PasswordEncryptedLocalStorage(deviceId, () => {
    const password = prompt('Enter password', '');
    if (password === null) {
      return Promise.reject(new Error('Rejected by user'));
    }
    return Promise.resolve(password || '');
  });
