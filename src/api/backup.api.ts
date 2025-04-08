import { getCall, postCall } from './utils.api';
import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { ENV_CONFIG } from '../env_config.ts';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export type TPassphrases = Record<string, IPassphraseInfo>;

export interface IBackupInfo {
  passphraseId: string;
  location: TPassphraseLocation;
  createdAt: number;
}

export interface IPassphraseInfo {
  passphraseId: string;
  location: TPassphraseLocation;
}

export interface IPassphrase {
  passphrase: string;
  passphraseId: string;
}

export const getLatestBackup = async (
  walletId: string,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IBackupInfo | null> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    try {
      const latestBackup: any = await embeddedWalletSDK.getLatestBackup();
      return latestBackup;
    } catch (e) {
      return null;
    }
  }
  const response = await getCall(`api/wallets/${walletId}/backup/latest`, token);
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else if (response.status === 404) {
    return null;
  } else {
    throw new Error('Failed to get latest backup');
  }
};

export const getPassphraseInfo = async (
  passphraseId: string,
  token: string,
): Promise<{ location: TPassphraseLocation }> => {
  const response = await getCall(`api/passphrase/${passphraseId}`, token);
  return response.json();
};

export const createPassphraseInfo = async (passphraseId: string, location: TPassphraseLocation, token: string) => {
  const response = await postCall(`api/passphrase/${passphraseId}`, token, { location });
  return response;
};

export const getPassphraseInfos = async (token: string): Promise<{ passphrases: IPassphraseInfo[] }> => {
  const response = await getCall(`api/passphrase/`, token);
  return response.json();
};
