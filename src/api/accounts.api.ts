import { getCall } from './utils.api';
import { EmbeddedWallet } from '@fireblocks/embedded-wallet-sdk';
import { ENV_CONFIG } from '../env_config.ts';

export interface IAccountDTO {
  walletId: string;
  accountId: number;
}

export const getAccounts = async (
  deviceId: string,
  token: string,
  embeddedWalletSDK: EmbeddedWallet | undefined,
): Promise<IAccountDTO[]> => {
  if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDK) {
    const re: Promise<any> = await embeddedWalletSDK?.getAccounts();
    return re?.data ?? re;
  }
  const response = await getCall(`api/devices/${deviceId}/accounts/`, token);
  return response.json();
};
