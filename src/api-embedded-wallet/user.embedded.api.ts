import { RootStore } from '@store';

export const getUserId = async (token: string, rootStore: RootStore | null = null): Promise<string> => {
    // todo: how to get userId on embedded wallet?
  const userId = rootStore?.userStore.getGoogleDriveUserInfo();
  return new Promise((resolve) => {
    resolve(userId);
  });
};
