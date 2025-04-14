import { RootStore } from '@store';
import { postCall } from './utils.api';

export const getUserId = async (token: string, rootStore: RootStore | null = null): Promise<string> => {
  const response = await postCall('api/login', token);
  const userId = response.id;
  return userId;
};
