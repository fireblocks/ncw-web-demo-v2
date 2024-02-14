import { postCall } from './utils';

export const getUserId = async (token: string): Promise<string> => {
  const response = await postCall('api/login', token);
  const userId = response.id;
  return userId;
};
