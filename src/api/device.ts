import { generateDeviceId } from '@fireblocks/ncw-js-sdk';
import { postCall } from './utils';

const DEVICE_ID_KEY = 'DEMO_APP:deviceId';

const getDeviceIdFromLocalStorage = (userId: string) => localStorage.getItem(`${DEVICE_ID_KEY}-${userId}`);

const saveDeviceIdToLocalStorage = (deviceId: string, userId: string) => {
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

export const assignDeviceToNewWallet = async (deviceId: string, token: string): Promise<string> => {
  const response = await postCall(`api/devices/${deviceId}/assign`, token);
  return response.walletId;
};
