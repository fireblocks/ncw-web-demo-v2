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
    const response = await rootStore?.fireblocksSDKStore.fireblocksEW.getLatestBackup();
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
    //throw new Error(`Unknown passphraseId prefix: ${passphraseId}`);
  }
}

export const getPassphraseInfo = async (
  passphraseId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IPassphraseInfo> => {
  try {
    console.log('getPassphraseInfo embedded wallet: ', token, passphraseId, rootStore);
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
): Promise<{ passphrases: IPassphraseInfo[] }> => {
  const passphrases: { passphrases: IPassphraseInfo[] } = {
    passphrases: [],
  };
  console.log('getPassphraseInfos embedded wallet: ', token);
  try {
    const res = await rootStore?.fireblocksSDKStore.fireblocksEW.getLatestBackup();
    console.log('getPassphraseInfos res: ', res);
    passphrases.passphrases.push({ passphraseId: res.passphraseId, location: 'GoogleDrive' });
  } catch (error: any) {
    // Check if this is the "No backup found" error
    if (error.message === 'No backup found' || (error.code === 'UNKNOWN' && error.message === 'No backup found')) {
      console.log('No existing backup found - this is normal for first-time backup');
      return null; // Return null to indicate no backup exists yet
    }

    // Log other errors and rethrow
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', error);
    throw error;
  }
  // const reduced = passphrases.passphrases.reduce<TPassphrases>((p, v) => {
  //   p[v.passphraseId] = v;
  //   console.log('getPassphraseInfos embedded wallet - p: ', p);
  //   return p;
  // }, {});
  // console.log('getPassphraseInfos embedded wallet - reduced: ', reduced);
  return passphrases;
};

// @ts-ignore
export const createPassphraseInfo = async (
  passphraseId: string,
  location: TPassphraseLocation,
  token: string,
  rootStore: RootStore | null = null,
) => {
  try {
    console.log('createPassphraseInfo embedded wallet: ', token, passphraseId, location, rootStore);
    const startWith = location === 'GoogleDrive' ? 'gdrive' : 'icloud';
    return Promise.resolve({ passphraseId: startWith + passphraseId, location: 'GoogleDrive' });
  } catch (e) {
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', e);
  }
};
