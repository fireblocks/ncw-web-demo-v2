import { IAccountResponse } from '@fireblocks/embedded-wallet-sdk';
import { RootStore } from '@store';

export const getAccounts = async (
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<IAccountResponse[]> => {
  console.log('getAccounts embedded wallet');
  try {
    const accounts = await rootStore?.fireblocksSDKStore.fireblocksEW.getAccounts();
    return accounts?.data ?? [];
  } catch (error) {
    console.error('[EmbeddedWallet] Error getting assets:', error);
    return [];
  }
};
