import { IPassphraseInfo, TPassphrases } from '@api';
import { RootStore } from '@store';
import { IBackupInfo } from '../api';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

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
  try {
    const res = await rootStore?.fireblocksSDKStore.fireblocksEW.getLatestBackup();
    passphrases.passphrases.push({ passphraseId: res.passphraseId, location: 'GoogleDrive' });
  } catch (e) {
    console.error('backup.embedded.api.ts - getPassphraseInfo err: ', e);
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
