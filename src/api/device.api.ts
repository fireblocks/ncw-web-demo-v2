import { generateDeviceId } from '@fireblocks/ncw-js-sdk';
import { getCall, postCall } from './utils.api';
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
  deviceId: string,
  token: string,
  rootStore: RootStore | null = null,
): Promise<string> => {
  const response = await postCall(`api/devices/${deviceId}/assign`, token);
  return response.walletId;
};

export const getDevices = async (token: string, rootStore: RootStore | null = null): Promise<IDeviceDTO[]> => {
  const response = await getCall('api/devices/', token);
  const { devices } = await response.json();
  return devices;
};
