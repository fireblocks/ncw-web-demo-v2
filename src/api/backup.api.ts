import { getCall, postCall } from './utils.api';
import { RootStore } from '@store';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export interface LatestBackupKey {
  deviceId: string;
  publicKey: string;
  keyId: string;
  algorithm: string;
}

export type TPassphrases = Record<string, IPassphraseInfo>;

export interface IBackupInfo {
  passphraseId: string;
  location: TPassphraseLocation;
  createdAt: number;
  keys?: Array<LatestBackupKey>;
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
  rootStore: RootStore | null = null,
): Promise<IBackupInfo | null> => {
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
  rootStore: RootStore | null = null,
): Promise<{ location: TPassphraseLocation }> => {
  const response = await getCall(`api/passphrase/${passphraseId}`, token);
  return response.json();
};

export const getPassphraseInfos = async (
  token: string,
  rootStore: RootStore | null = null,
): Promise<{ passphrases: IPassphraseInfo[] }> => {
  const response = await getCall(`api/passphrase/`, token);
  return response.json();
};

export const createPassphraseInfo = async (
  passphraseId: string,
  location: TPassphraseLocation,
  token: string,
  rootStore: RootStore | null = null,
) => {
  const response = await postCall(`api/passphrase/${passphraseId}`, token, { location });
  return response;
};
