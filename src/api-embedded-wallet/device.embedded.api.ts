import { generateDeviceId } from '@fireblocks/ncw-js-sdk';
import { RootStore } from '@store';

const DEVICE_ID_KEY = 'DEMO_APP:deviceId';

export interface IDeviceDTO {
  deviceId: string;
  walletId: string;
  createdAt: number;
}

export const getDeviceIdFromLocalStorage = (userId: string) => localStorage.getItem(`${DEVICE_ID_KEY}-${userId}`);

export const saveDeviceIdToLocalStorage = (deviceId: string, userId: string) => {
  localStorage.setItem(`${DEVICE_ID_KEY}-${userId}`, deviceId);
};

export const getOrGenerateDeviceId = (userId: string) => {
  const deviceId = getDeviceIdFromLocalStorage(userId);

  if (deviceId) {
    return deviceId;
  }

  const uuid = generateDeviceId();
  saveDeviceIdToLocalStorage(uuid, userId);
  return uuid;
};

export const generateNewDeviceId = (userId: string) => {
  const uuid = generateDeviceId();
  saveDeviceIdToLocalStorage(uuid, userId);
  return uuid;
};

export const assignDeviceToNewWallet = async (
  _deviceId: string,
  _token: string,
  rootStore: RootStore | null = null,
): Promise<string> => {
  try {
    const assignResponse = await rootStore?.fireblocksSDKStore?.fireblocksEW?.assignWallet();
    return assignResponse?.walletId ?? '';
  } catch (e) {
    console.error('device.embedded.api.ts - assignDeviceToNewWallet err: ', e);
    return '';
  }
};

export const getDevices = async (_token: string, rootStore: RootStore | null = null): Promise<IDeviceDTO[]> => {
  if (rootStore?.deviceStore?.walletId) {
    return new Promise((resolve) => {
      resolve([
        {
          deviceId: rootStore?.deviceStore?.deviceId,
          walletId: rootStore?.deviceStore?.walletId,
          createdAt: Date.now(),
        },
        {
          deviceId: rootStore?.deviceStore?.deviceId,
          walletId: rootStore?.deviceStore?.walletId,
          createdAt: Date.now(),
        },
      ]);
    });
  } else {
    return [];
  }
};
