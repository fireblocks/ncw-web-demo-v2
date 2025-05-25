import { RootStore } from '@store';

export const getUserId = async (token: string, rootStore: RootStore | null = null): Promise<string> => {
  const userId = rootStore?.userStore.getGoogleDriveUserInfo();
  return new Promise((resolve) => {
    // @ts-expect-error
    resolve(userId);
  });
};
