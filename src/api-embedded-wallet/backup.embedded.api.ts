import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { NCW } from 'fireblocks-sdk';
import { IPassphraseInfo, TPassphrases } from '@api';

export type TPassphraseLocation = 'GoogleDrive' | 'iCloud';

export const getLatestBackup = async (fireblocksEW: EmbeddedWallet): Promise<NCW.LatestBackupResponse | null> => {
  try {
    const backup = await fireblocksEW.getLatestBackup();
    return backup;
  } catch (e) {
    console.error('backup.embedded.api.ts - getLatestBackup err: ', e);
    return null;
  }
};

export const getPassphraseInfo = async (fireblocksEW: EmbeddedWallet): Promise<IPassphraseInfo> => {
    try {
      // todo: ?
      return null;
    } catch (e) {
      console.error('backup.embedded.api.ts - getPassphraseInfo err: ', e);
    }
};

export const getPassphraseInfos = async (fireblocksEW: EmbeddedWallet): Promise<IPassphraseInfo[]> => {
  const passphrases: { passphrases: IPassphraseInfo[] } = {
    passphrases: [],
  };
  try {
    const res = await fireblocksEW.getLatestBackup();
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

export const createPassphraseInfo = async (fireblocksEW: EmbeddedWallet, passphraseId: string, location: TPassphraseLocation) => {
    // todo: how to create Passphrase, we should put it where?

};
