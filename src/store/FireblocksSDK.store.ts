import { ITransactionDTO, TFireblocksNCWStatus, TKeysStatusRecord, sendMessage } from '@api';
import {
  ConsoleLoggerFactory,
  FireblocksNCWFactory,
  IEventsHandler,
  IFireblocksNCW,
  IMessagesHandler,
  TEnv,
  TEvent,
  TMPCAlgorithm,
} from '@fireblocks/ncw-js-sdk';
import { IndexedDBLogger, IndexedDBLoggerFactory, secureStorageProviderFactory } from '@services';
import { ENV_CONFIG } from 'env_config';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class FireblocksSDKStore {
  @observable public sdkStatus: TFireblocksNCWStatus;
  @observable public keysStatus: TKeysStatusRecord | null;
  @observable public sdkInstance: IFireblocksNCW | null;
  @observable public keysBackupStatus: string;
  @observable public keysRecoveryStatus: string;
  @observable public joinWalletEventDescriptor: string;
  @observable public isMPCReady: boolean;
  @observable public isMPCGenerating: boolean;
  @observable public error: string;
  @observable public logger: IndexedDBLogger | null;

  private _rootStore: RootStore;
  private _unsubscribeTransactionsPolling: (() => void) | null;

  constructor(rootStore: RootStore) {
    this.sdkStatus = 'sdk_not_ready';
    this.keysStatus = null;
    this.sdkInstance = null;
    this.logger = null;
    this.keysBackupStatus = '';
    this.keysRecoveryStatus = '';
    this.joinWalletEventDescriptor = '';
    this.isMPCReady = false;
    this.isMPCGenerating = false;
    this.error = '';

    this._unsubscribeTransactionsPolling = null;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async dispose(): Promise<void> {
    if (!this.sdkInstance) {
      return;
    }

    if (this._unsubscribeTransactionsPolling) {
      this._unsubscribeTransactionsPolling();
      this._unsubscribeTransactionsPolling = null;
    }

    await this.sdkInstance.dispose();
    this.setSDKInstance(null);
    this.setKeysStatus(null);
    this.setSDKStatus('sdk_not_ready');
  }

  @action
  public async init() {
    this.setIsMPCGenerating(true);
    this.setSDKInstance(null);
    this.setSDKStatus('initializing_sdk');

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

      const logger = await IndexedDBLoggerFactory({
        deviceId: this._rootStore.deviceStore.deviceId,
        logger: ConsoleLoggerFactory(),
      });

      const sdkInstance = await FireblocksNCWFactory({
        env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
        logLevel: 'INFO',
        deviceId: this._rootStore.deviceStore.deviceId,
        messagesHandler,
        eventsHandler,
        secureStorageProvider: secureStorageProviderFactory(this._rootStore.deviceStore.deviceId),
        logger,
      });

      this.setLogger(logger);
      this.setSDKInstance(sdkInstance);

      this.setUnsubscribeTransactionsPolling(
        this._rootStore.transactionsStore.listenToTransactions((transaction: ITransactionDTO) => {
          this._rootStore.transactionsStore.addOrEditTransaction(transaction);
        }),
      );
      if (this.sdkInstance) {
        const keyStatus = await this.sdkInstance.getKeysStatus();
        if (Object.keys(keyStatus).length > 0) {
          this.setKeysStatus(keyStatus);
          this.setSDKStatus('sdk_available');
        }
        this.setIsMPCGenerating(false);
      }
    } catch (error) {
      this.setIsMPCGenerating(false);
      this.setSDKStatus('sdk_initialization_failed');
      throw error;
    }
  }

  @action
  public setLogger(logger: IndexedDBLogger | null): void {
    this.logger = logger;
  }

  @action
  public setError(error: string): void {
    this.error = error;
  }

  @action
  public clearSDKStorage() {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
    } else {
      this.setKeysStatus(null);
      localStorage.clear();
    }
  }

  @action
  public generateMPCKeys(): void {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
    } else {
      this.setIsMPCReady(false);
      this.setIsMPCGenerating(true);
      const ALGORITHMS = new Set<TMPCAlgorithm>(['MPC_CMP_ECDSA_SECP256K1']);
      this.sdkInstance
        .generateMPCKeys(ALGORITHMS)
        .then(() => {
          this.setIsMPCReady(true);
          this.setIsMPCGenerating(false);
        })
        .catch((error) => {
          this.setError(error.message);
        });
    }
  }

  public async checkMPCKeys() {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
    } else {
      this.setIsMPCReady(false);
      this.setIsMPCGenerating(true);
      const keysStatus = await this.sdkInstance.getKeysStatus();

      const secP256K1Status = keysStatus.MPC_CMP_ECDSA_SECP256K1?.keyStatus ?? null;
      const ed25519Status = keysStatus.MPC_EDDSA_ED25519?.keyStatus ?? null;

      if (secP256K1Status === 'READY' || ed25519Status === 'READY') {
        this.setIsMPCReady(true);
      } else {
        this.setIsMPCReady(false);
      }
      this.setIsMPCGenerating(false);
    }
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
  public setIsMPCReady(isReady: boolean) {
    this.isMPCReady = isReady;
  }

  @action
  public setSDKStatus(status: TFireblocksNCWStatus) {
    this.sdkStatus = status;
  }

  @action
  public setSDKInstance(instance: IFireblocksNCW | null) {
    this.sdkInstance = instance;
  }

  @action
  public setIsMPCGenerating(isMPCGenerating: boolean) {
    this.isMPCGenerating = isMPCGenerating;
  }

  @action
  private setUnsubscribeTransactionsPolling(callBack: () => void) {
    this._unsubscribeTransactionsPolling = callBack;
  }

  @computed
  public get keysAreReady(): boolean {
    if (this.keysStatus) {
      return Object.values(this.keysStatus).every((key) => key.keyStatus === 'READY');
    }

    return false;
  }

  public async clearLogs(): Promise<void> {
    if (this.logger) {
      await this.logger.clear(null);
    }
  }

  public async collectLogs(): Promise<string> {
    if (this.logger) {
      const logs = await this.logger.collect(null);
      const logsString = logs.map((log) => JSON.stringify(log)).join('\n');

      return logsString;
    }

    return '';
  }
}
