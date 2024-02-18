import { TFireblocksNCWStatus, TKeysStatusRecord, sendMessage } from '@api';
import {
  ConsoleLoggerFactory,
  FireblocksNCWFactory,
  IEventsHandler,
  IFireblocksNCW,
  IMessagesHandler,
  TEnv,
  TEvent,
} from '@fireblocks/ncw-js-sdk';
import { PasswordEncryptedLocalStorage } from '@services';
import { ENV_CONFIG } from 'env_config';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class FireblocksSDKStore {
  @observable public sdkStatus: TFireblocksNCWStatus;
  @observable public keysStatus: TKeysStatusRecord | null;
  @observable public sdk: IFireblocksNCW | null;
  @observable public keysBackupStatus: string;
  @observable public keysRecoveryStatus: string;
  @observable public joinWalletEventDescriptor: string;
  @observable public transactionSignatureStatus: string;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.sdkStatus = 'sdk_not_ready';
    this.keysStatus = null;
    this.sdk = null;
    this.keysBackupStatus = '';
    this.keysRecoveryStatus = '';
    this.joinWalletEventDescriptor = '';
    this.transactionSignatureStatus = '';

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init() {
    this.sdk = null;
    this.sdkStatus = 'initializing_sdk';
    try {
      const messagesHandler: IMessagesHandler = {
        handleOutgoingMessage: (message: string) => {
          if (!this._rootStore.deviceStore.deviceId) {
            throw new Error('deviceId is not set');
          }
          return sendMessage(this._rootStore.deviceStore.deviceId, this._rootStore.userStore.accessToken, message);
        },
      };

      const eventsHandler: IEventsHandler = {
        handleEvent: (event: TEvent) => {
          switch (event.type) {
            case 'key_descriptor_changed':
              this.setKeysStatus({
                [event.keyDescriptor.algorithm]: event.keyDescriptor,
              } as TKeysStatusRecord);
              break;

            case 'transaction_signature_changed':
              this.setTransactionSignatureStatus(JSON.stringify(event.transactionSignature));
              break;

            case 'keys_backup':
              this.setKeysBackupStatus(JSON.stringify(event.keysBackup));
              break;

            case 'keys_recovery':
              this.setKeysRecoveryStatus(JSON.stringify(event.keyDescriptor));
              break;

            case 'join_wallet_descriptor':
              this.setJoinWalletEventDescriptor(JSON.stringify(event.joinWalletDescriptor));
              break;
          }
        },
      };

      const secureStorageProvider = new PasswordEncryptedLocalStorage(this._rootStore.deviceStore.deviceId, () => {
        const password = prompt('Enter password', '');
        if (password === null) {
          return Promise.reject(new Error('Rejected by user'));
        }
        return Promise.resolve(password || '');
      });

      this.sdk = await FireblocksNCWFactory({
        env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
        logLevel: 'VERBOSE',
        deviceId: this._rootStore.deviceStore.deviceId,
        messagesHandler,
        eventsHandler,
        secureStorageProvider,
        logger: ConsoleLoggerFactory(),
      });
    } catch (error) {
      this.sdkStatus = 'sdk_initialization_failed';
      throw error;
    }
  }

  @action
  public async clearSDKStorage() {
    if (!this.sdk) {
      throw new Error('fireblocksNCW is not initialized');
    }
    localStorage.clear();
    await this.sdk.clearAllStorage();
    const keyStatus = await this.sdk.getKeysStatus();
    this.setKeysStatus(keyStatus);
  }

  @action
  public setKeysStatus(keysStatus: TKeysStatusRecord | null) {
    this.keysStatus = keysStatus;
  }

  @action
  public setKeysBackupStatus(status: string) {
    this.keysBackupStatus = status;
  }

  @action
  public setKeysRecoveryStatus(status: string) {
    this.keysRecoveryStatus = status;
  }

  @action
  public setJoinWalletEventDescriptor(descriptor: string) {
    this.joinWalletEventDescriptor = descriptor;
  }

  @action
  public setTransactionSignatureStatus(status: string) {
    this.transactionSignatureStatus = status;
  }
}
