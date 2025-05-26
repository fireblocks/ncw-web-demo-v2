import { RootStore } from '@store';

// eslint-disable-next-line @typescript-eslint/require-await
export const getUserId = async (_token: string, rootStore: RootStore | null = null) => {
  const user = rootStore?.userStore.getGoogleDriveUserInfo();
  return user?.uid;
};
