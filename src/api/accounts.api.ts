import { RootStore } from '@store';
import { getCall } from './utils.api';

export interface IAccountDTO {
  walletId: string;
  accountId: number;
}

export const getAccounts = async (deviceId: string, token: string): Promise<IAccountDTO[]> => {
  console.log('getAccounts proxy backend call');
  const response = await getCall(`api/devices/${deviceId}/accounts/`, token);
  return response.json();
};
