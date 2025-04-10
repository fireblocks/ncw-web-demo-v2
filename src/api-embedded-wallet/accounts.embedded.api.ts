import { EmbeddedWallet, IAccountResponse } from '@fireblocks/embedded-wallet-sdk';

export const getAccounts = async (fireblocksEW: EmbeddedWallet): Promise<IAccountResponse[]> => {
  try {
    const accounts = await fireblocksEW.getAccounts();
    return accounts?.data ?? [];
  } catch (e) {
    console.error('accounts.embedded.api.ts - getAccounts err: ', e);
    return [];
  }
};
