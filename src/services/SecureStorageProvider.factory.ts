import { ISecureStorageProvider, TReleaseSecureStorageCallback } from '@fireblocks/ncw-js-sdk';
import { PasswordEncryptedLocalStorage } from './PasswordEncryptedLocalStorage.service';
import { handleDecryptionError } from './ErrorHandling.utils';

// Create a wrapper around PasswordEncryptedLocalStorage that provides better error messages
class EnhancedPasswordStorage implements ISecureStorageProvider {
  private storage: PasswordEncryptedLocalStorage;

  constructor(deviceId: string) {
    this.storage = new PasswordEncryptedLocalStorage(deviceId, () => {
      const password = prompt('Enter password', '');
      return Promise.resolve(password || '');
    });
  }

  async getAccess(): Promise<TReleaseSecureStorageCallback> {
    try {
      return await this.storage.getAccess();
    } catch (error: any) {
      // Provide more specific error messages for common failures
      return handleDecryptionError(error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.storage.get(key);
    } catch (error: any) {
      // Provide more specific error messages for common failures
      return handleDecryptionError(error);
    }
  }

  async set(key: string, data: string): Promise<void> {
    try {
      return await this.storage.set(key, data);
    } catch (error: any) {
      // Provide more specific error messages for common failures
      return handleDecryptionError(error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await this.storage.getAllKeys();
    } catch (error: any) {
      // Provide more specific error messages for common failures
      return handleDecryptionError(error);
    }
  }

  async clear(): Promise<void> {
    try {
      return await this.storage.clear();
    } catch (error: any) {
      // Provide more specific error messages for common failures
      return handleDecryptionError(error);
    }
  }
}

export const secureStorageProviderFactory = (deviceId: string) => new EnhancedPasswordStorage(deviceId);
