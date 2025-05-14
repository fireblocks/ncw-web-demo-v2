import { IAccountResponse } from '@fireblocks/embedded-wallet-sdk';
import { RootStore } from '@store';

export const getAccounts = async (
  _deviceId: string,
  _token: string,
  rootStore: RootStore | null = null,
): Promise<IAccountResponse[]> => {
  try {
    if (!rootStore?.fireblocksSDKStore?.fireblocksEW) {
      return [];
    }
    const accounts = await rootStore.fireblocksSDKStore.fireblocksEW.getAccounts();
    console.log('getAccounts embedded wallet: ', accounts);
    return accounts?.data ?? [];
  } catch (error) {
    console.error('[EmbeddedWallet] Error getting assets:', error);
    return [];
  }
};
