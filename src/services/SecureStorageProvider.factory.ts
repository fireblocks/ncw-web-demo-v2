import { ISecureStorageProvider, TReleaseSecureStorageCallback } from '@fireblocks/ncw-js-sdk';
import { PasswordEncryptedLocalStorage } from './PasswordEncryptedLocalStorage.service';

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
      if (error.message.includes('decrypt') || error.message.includes('integrity') || 
          error.message.includes('authentication failed') || error.message.includes('bad decrypt')) {
        throw new Error('Incorrect password. Please try again with the correct password.');
      }
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.storage.get(key);
    } catch (error: any) {
      // Provide more specific error messages for common failures
      if (error.message.includes('decrypt') || error.message.includes('integrity') || 
          error.message.includes('authentication failed') || error.message.includes('bad decrypt')) {
        throw new Error('Incorrect password. Please try again with the correct password.');
      }
      throw error;
    }
  }

  async set(key: string, data: string): Promise<void> {
    try {
      return await this.storage.set(key, data);
    } catch (error: any) {
      // Provide more specific error messages for common failures
      if (error.message.includes('decrypt') || error.message.includes('integrity') || 
          error.message.includes('authentication failed') || error.message.includes('bad decrypt')) {
        throw new Error('Incorrect password. Please try again with the correct password.');
      }
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await this.storage.getAllKeys();
    } catch (error: any) {
      // Provide more specific error messages for common failures
      if (error.message.includes('decrypt') || error.message.includes('integrity') || 
          error.message.includes('authentication failed') || error.message.includes('bad decrypt')) {
        throw new Error('Incorrect password. Please try again with the correct password.');
      }
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      return await this.storage.clear();
    } catch (error: any) {
      // Provide more specific error messages for common failures
      if (error.message.includes('decrypt') || error.message.includes('integrity') || 
          error.message.includes('authentication failed') || error.message.includes('bad decrypt')) {
        throw new Error('Incorrect password. Please try again with the correct password.');
      }
      throw error;
    }
  }
}

export const secureStorageProviderFactory = (deviceId: string) => new EnhancedPasswordStorage(deviceId);
