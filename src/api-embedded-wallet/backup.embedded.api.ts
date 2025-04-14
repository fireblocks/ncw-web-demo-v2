import { IPassphraseInfo } from '@api';
import { RootStore } from '@store';
import { IBackupInfo } from '../api';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export type TPassphrases = Record<string, IPassphraseInfo>;

export const getLatestBackup = async (
  walletId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IBackupInfo | null> => {
  try {
    console.log('[EmbeddedWalletSDK] Getting latest backup');
    const response = await rootStore?.fireblocksSDKStore.fireblocksEW.getLatestBackup();
    return {
      passphraseId: response?.passphraseId,
      location: determineLocation(response.passphraseId),
      createdAt: response?.createdAt,
      keys: response?.keys,
    };
    console.log('[EmbeddedWalletSDK] Latest backup retrieved');
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
    throw new Error(`Unknown passphraseId prefix: ${passphraseId}`);
  }
}

export const getPassphraseInfo = async (
  passphraseId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IPassphraseInfo> => {
    try {
      // todo: ?
      return null;
    } catch (e) {
      console.error('backup.embedded.api.ts - getPassphraseInfo err: ', e);
    }
};

export const getPassphraseInfos = async (
  token: string,
  rootStore: RootStore | null = null,
): Promise<IPassphraseInfo[]> => {
  const passphrases: { passphrases: IPassphraseInfo[] } = {
    passphrases: [],
  };
  console.log('getPassphraseInfos embedded wallet');
  try {
    const res = await rootStore?.fireblocksSDKStore.fireblocksEW.getLatestBackup();
    passphrases.passphrases.push({ passphraseId: res.passphraseId, location: 'GoogleDrive' });
  } catch (error) {
    // Check if this is the "No backup found" error
    if (error.message === 'No backup found' || (error.code === 'UNKNOWN' && error.message === 'No backup found')) {
      console.log('No existing backup found - this is normal for first-time backup');
      return null; // Return null to indicate no backup exists yet
    }

    // Log other errors and rethrow
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', error);
    throw error;

  }
  const reduced = passphrases.passphrases.reduce<TPassphrases>((p, v) => {
    p[v.passphraseId] = v;
    return p;
  }, {});
  return reduced;
};

export const createPassphraseInfo = async (
  passphraseId: string,
  location: TPassphraseLocation,
  token: string,
  rootStore: RootStore | null = null,
) => {
    // todo: how to create Passphrase, we should put it where?

};
