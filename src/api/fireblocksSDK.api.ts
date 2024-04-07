import { IKeyDescriptor, TMPCAlgorithm } from '@fireblocks/ncw-js-sdk';
import { postCall } from './utils.api';

export type TFireblocksNCWStatus = 'sdk_not_ready' | 'initializing_sdk' | 'sdk_available' | 'sdk_initialization_failed';
export type TKeysStatusRecord = Record<TMPCAlgorithm, IKeyDescriptor>;

export const sendMessage = async (deviceId: string, token: string, message: string): Promise<any> =>
  postCall(`api/devices/${deviceId}/rpc`, token, { message });
