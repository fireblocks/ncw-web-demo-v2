import { IPassphraseInfo } from '@api';
import { RootStore } from '@store';
import { IBackupInfo } from '../api';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export type TPassphrases = Record<string, IPassphraseInfo>;

export const getLatestBackup = async (
  _walletId: string,
  _token: string,
  rootStore: RootStore | null = null,
): Promise<IBackupInfo | null> => {
  try {
    const response = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getLatestBackup();
    if (response) {
      return {
        passphraseId: response.passphraseId,
        location: 'GoogleDrive',
        createdAt: response.createdAt,
        keys: response.keys,
      };
    }
  } catch (error) {
    console.error('getLatestBackup: [EmbeddedWalletSDK] Error getting latest backup:', error);
  }

  return null;
};

export const getPassphraseInfos = async (
  _token: string,
  rootStore?: RootStore,
): Promise<{ passphrases: IPassphraseInfo[] } | null> => {
  try {
    const res: any = await rootStore?.fireblocksSDKStore?.fireblocksEW?.getLatestBackup();
    return { passphrases: [{ passphraseId: res.passphraseId, location: 'GoogleDrive' }] };
  } catch (error: any) {
    // Check if this is the "No backup found" error
    if (error.message === 'No backup found') {
      console.warn('getPassphraseInfos: No backup found');
      return { passphrases: [] };
    }

    console.error('getPassphraseInfos: ', error);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/require-await
export const createPassphraseInfo = async (passphraseId: string, location: TPassphraseLocation, _token: string) => ({
  passphraseId,
  location,
});
