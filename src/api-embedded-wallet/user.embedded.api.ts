import { RootStore } from '@store';

export const getUserId = async (_token: string, rootStore: RootStore | null = null): Promise<string> => {
  const user = rootStore?.userStore.getGoogleDriveUserInfo();
  return Promise.resolve(user?.uid || '');
};
