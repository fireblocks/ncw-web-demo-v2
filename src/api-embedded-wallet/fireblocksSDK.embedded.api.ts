import { IKeyDescriptor, TMPCAlgorithm } from '@fireblocks/ncw-js-sdk';
import { RootStore } from '@store';

export type TFireblocksNCWStatus = 'sdk_not_ready' | 'initializing_sdk' | 'sdk_available' | 'sdk_initialization_failed';
export type TKeysStatusRecord = Record<TMPCAlgorithm, IKeyDescriptor>;

export const sendMessage = async (
  deviceId: string,
  token: string,
  message: string,
  rootStore: RootStore | null = null,
): Promise<any> => {
  // todo: what is the sensMessage mechanism on the embedded wallet?
  console.log('sendMessage embedded wallet: ', message);
};
