import { generateDeviceId } from '@fireblocks/ncw-js-sdk';

const DEVICE_ID_KEY = 'DEMO_APP:deviceId';

const getDeviceIdFromLocalStorage = (userId: string) => {
  return localStorage.getItem(`${DEVICE_ID_KEY}-${userId}`);
};

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
