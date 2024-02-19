import { ITransactionDTO, TFireblocksNCWStatus, TKeysStatusRecord, sendMessage } from '@api';
import {
  ConsoleLoggerFactory,
  FireblocksNCWFactory,
  IEventsHandler,
  IFireblocksNCW,
  IMessagesHandler,
  TEnv,
  TEvent,
} from '@fireblocks/ncw-js-sdk';
import { secureStorageProviderFactory } from '@services';
import { ENV_CONFIG } from 'env_config';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class FireblocksSDKStore {
  @observable public sdkStatus: TFireblocksNCWStatus;
  @observable public keysStatus: TKeysStatusRecord | null;
  @observable public sdkInstance: IFireblocksNCW | null;
  @observable public keysBackupStatus: string;
  @observable public keysRecoveryStatus: string;
  @observable public joinWalletEventDescriptor: string;

  private _rootStore: RootStore;
  private _unsubscribeTransactionsPolling: (() => void) | null;

  constructor(rootStore: RootStore) {
    this.sdkStatus = 'sdk_not_ready';
    this.keysStatus = null;
    this.sdkInstance = null;
    this.keysBackupStatus = '';
    this.keysRecoveryStatus = '';
    this.joinWalletEventDescriptor = '';

    this._unsubscribeTransactionsPolling = null;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public dispose(): void {
    if (!this.sdkInstance) {
      return;
    }

    if (this._unsubscribeTransactionsPolling) {
      this._unsubscribeTransactionsPolling();
      this._unsubscribeTransactionsPolling = null;
    }
  }

  @action
  public async init() {
    this.sdkInstance = null;
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
              this._rootStore.transactionsStore
                .getTransactionById(event.transactionSignature.txId)
                ?.updateSignatureStatus(event.transactionSignature.transactionSignatureStatus);
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

      this.sdkInstance = await FireblocksNCWFactory({
        env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
        logLevel: 'VERBOSE',
        deviceId: this._rootStore.deviceStore.deviceId,
        messagesHandler,
        eventsHandler,
        secureStorageProvider: secureStorageProviderFactory(this._rootStore.deviceStore.deviceId),
        logger: ConsoleLoggerFactory(),
      });

      this.setUnsubscribeTransactionsPolling(
        this._rootStore.transactionsStore.listenToTransactions((transaction: ITransactionDTO) => {
          this._rootStore.transactionsStore.addOrEditTransaction(transaction);
        }),
      );
      const keyStatus = await this.sdkInstance.getKeysStatus();
      this.setKeysStatus(keyStatus);
      this.sdkStatus = 'sdk_available';
    } catch (error) {
      this.sdkStatus = 'sdk_initialization_failed';
      throw error;
    }
  }

  @action
  public async clearSDKStorage() {
    if (!this.sdkInstance) {
      throw new Error('fireblocksNCW is not initialized');
    }
    localStorage.clear();
    await this.sdkInstance.clearAllStorage();
    const keyStatus = await this.sdkInstance.getKeysStatus();
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
  private setUnsubscribeTransactionsPolling(callBack: () => void) {
    this._unsubscribeTransactionsPolling = callBack;
  }
}
