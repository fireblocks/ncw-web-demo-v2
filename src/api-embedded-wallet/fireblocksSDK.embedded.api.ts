import { IKeyDescriptor, TMPCAlgorithm } from '@fireblocks/ncw-js-sdk';
import { RootStore } from '@store';

export type TFireblocksNCWStatus = 'sdk_not_ready' | 'initializing_sdk' | 'sdk_available' | 'sdk_initialization_failed';
export type TKeysStatusRecord = Record<TMPCAlgorithm, IKeyDescriptor>;

export const sendMessage = (
  _deviceId: string,
  _token: string,
  _message: string,
  _rootStore: RootStore | null = null,
): { status: string; message: string } => ({
  status: 'ok',
  message: 'ok',
});
