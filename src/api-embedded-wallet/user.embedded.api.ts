import { RootStore } from '@store';

export const getUserId = async (token: string, rootStore: RootStore | null = null): Promise<string> => {
    // todo: how to get userId on embedded wallet?
  console.log('getUserId embedded wallet: ', token);
  const userId = rootStore?.userStore.getGoogleDriveUserInfo();
  return new Promise((resolve) => {
    // @ts-expect-error
    resolve(userId);
  });
};
