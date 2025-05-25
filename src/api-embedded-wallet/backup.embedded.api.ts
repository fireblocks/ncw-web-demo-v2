import { IPassphraseInfo } from '@api';
import { RootStore } from '@store';
import { IBackupInfo } from '../api';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export type TPassphrases = Record<string, IPassphraseInfo>;

export const getLatestBackup = async (
  walletId: string = '',
  token: string,
  rootStore: RootStore | null = null,
): Promise<IBackupInfo | null> => {
  try {
    console.log('[EmbeddedWalletSDK] Getting latest backup: ', walletId, token);
    const response = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getLatestBackup();
    console.log('[EmbeddedWalletSDK] Latest backup: ', response);
    if (response) {
      return {
        passphraseId: response?.passphraseId,
        location: determineLocation(response.passphraseId),
        createdAt: response?.createdAt,
        keys: response?.keys,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('getLatestBackup: [EmbeddedWalletSDK] Error getting latest backup:', error);
    return null;
  }
};

function determineLocation(passphraseId: string): TPassphraseLocation {
  if (passphraseId.startsWith('gdrive')) {
    return 'GoogleDrive';
  } else if (passphraseId.startsWith('icloud')) {
    return 'iCloud';
  } else {
    // default to GoogleDrive
    return 'GoogleDrive';
  }
}

export const getPassphraseInfo = async (
  passphraseId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IPassphraseInfo> => {
  try {
    return Promise.resolve({ passphraseId: passphraseId, location: 'GoogleDrive' });
  } catch (e) {
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', e);
    // Return a default value even in case of error
    return { passphraseId: passphraseId, location: 'GoogleDrive' };
  }
};

export const getPassphraseInfos = async (
  token: string,
  rootStore: RootStore | null = null,
): Promise<{ passphrases: IPassphraseInfo[] } | null> => {
  const passphrases: { passphrases: IPassphraseInfo[] } = {
    passphrases: [],
  };
  try {
    const res: any = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getLatestBackup();
    passphrases.passphrases.push({ passphraseId: res.passphraseId, location: 'GoogleDrive' });
  } catch (error: any) {
    // Check if this is the "No backup found" error
    if (error.message === 'No backup found' || (error.code === 'UNKNOWN' && error.message === 'No backup found')) {
      return null; // Return null to indicate no backup exists yet
    }

    // Log other errors and rethrow
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', error);
    throw error;
  }
  return passphrases;
};

export const createPassphraseInfo = async (
  passphraseId: string,
  location: TPassphraseLocation,
  token: string,
  rootStore: RootStore | null = null,
) => {
  try {
    const startWith = location === 'GoogleDrive' ? 'gdrive' : 'icloud';
    return Promise.resolve({ passphraseId: startWith + passphraseId, location: 'GoogleDrive' });
  } catch (e) {
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', e);
  }
};
