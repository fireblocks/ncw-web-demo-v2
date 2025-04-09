import { ITransactionDTO, TFireblocksNCWStatus, TKeysStatusRecord, sendMessage } from '@api';
import {
  ConsoleLoggerFactory,
  FireblocksNCWFactory,
  getFireblocksNCWInstance,
  IEventsHandler,
  IFireblocksNCW,
  IFullKey,
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
  @observable public isKeysExportInProcess: boolean;
  @observable public exportedKeys: IFullKey[] | null;
  @observable public error: string;
  @observable public logger: IndexedDBLogger | null;
  @observable public fprvKey: string | null;
  @observable public xprvKey: string | null;

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
    this.isKeysExportInProcess = false;
    this.exportedKeys = null;
    this.fprvKey = null;
    this.xprvKey = null;

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
    console.log('[SDK] Initializing SDK...');
    this.setIsMPCGenerating(true);
    this.setSDKInstance(null);
    this.setSDKStatus('initializing_sdk');

    try {
      console.log('[SDK] Setting up message and event handlers');
      const messagesHandler: IMessagesHandler = {
        handleOutgoingMessage: (message: string) => {
          console.log('[SDK] Handling outgoing message');
          if (!this._rootStore.deviceStore.deviceId) {
            console.error('[SDK] deviceId is not set');
            throw new Error('deviceId is not set');
          }
          return sendMessage(this._rootStore.deviceStore.deviceId, this._rootStore.userStore.accessToken, message);
        },
      };

      const eventsHandler: IEventsHandler = {
        handleEvent: (event: TEvent) => {
          console.log(`[SDK] Event received: ${event.type}`);
          switch (event.type) {
            case 'key_descriptor_changed':
              console.log('[SDK] Key descriptor changed event');
              this.sdkInstance
                ?.getKeysStatus()
                .then((keyStatus) => {
                  console.log('[SDK] Updated key status:', keyStatus);
                  this.setKeysStatus(keyStatus);
                })
                .catch((error) => {
                  console.error('[SDK] Failed to get key status:', error);
                  this.setError('fireblocksNCW failed to get key status');
                });
              break;

            case 'transaction_signature_changed':
              console.log(`[SDK] Transaction signature changed for txId: ${event.transactionSignature.txId}`);
              this._rootStore.transactionsStore
                .getTransactionById(event.transactionSignature.txId)
                ?.updateSignatureStatus(event.transactionSignature.transactionSignatureStatus);
              break;

            case 'keys_backup':
              console.log('[SDK] Keys backup event received');
              this.setKeysBackupStatus(JSON.stringify(event.keysBackup));
              break;

            case 'keys_recovery':
              console.log('[SDK] Keys recovery event received');
              this.setKeysRecoveryStatus(JSON.stringify(event.keyDescriptor));
              break;

            case 'join_wallet_descriptor':
              console.log('[SDK] Join wallet descriptor event received');
              this.setJoinWalletEventDescriptor(JSON.stringify(event.joinWalletDescriptor));
              break;
          }
        },
      };

      console.log('[SDK] Creating IndexedDB logger');
      const logger = await IndexedDBLoggerFactory({
        deviceId: this._rootStore.deviceStore.deviceId,
        logger: ConsoleLoggerFactory(),
      });

      let fireblocksNCW: IFireblocksNCW | null = null;

      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        console.log('[SDK] Using Embedded Wallet SDK initialization');
        // Embedded wallet SDK initialization
        fireblocksNCW = await FireblocksNCWFactory({
          env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
          logLevel: 'INFO',
          deviceId: this._rootStore.deviceStore.deviceId,
          messagesHandler,
          eventsHandler,
          secureStorageProvider: secureStorageProviderFactory(this._rootStore.deviceStore.deviceId),
          logger,
        });
        console.log('[SDK] Embedded wallet SDK initialized successfully');
      } else {
        // Regular SDK initialization
        let ncwInstance = getFireblocksNCWInstance(this._rootStore.deviceStore.deviceId);
        if (ncwInstance) {
          fireblocksNCW = ncwInstance;
        } else {
          fireblocksNCW = await FireblocksNCWFactory({
            env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
            logLevel: 'INFO',
            deviceId: this._rootStore.deviceStore.deviceId,
            messagesHandler,
            eventsHandler,
            secureStorageProvider: secureStorageProviderFactory(this._rootStore.deviceStore.deviceId),
            logger,
          });
        }
      }

      console.log('[SDK] SDK initialized, setting SDK instance');
      this.setLogger(logger);
      this.setSDKInstance(fireblocksNCW);

      if (this.sdkInstance) {
        console.log('[SDK] Getting keys status');
        const keyStatus = await this.sdkInstance.getKeysStatus();
        console.log('[SDK] Keys status:', keyStatus);
        if (Object.keys(keyStatus).length > 0) {
          this.setKeysStatus(keyStatus);
          this.setSDKStatus('sdk_available');
          console.log('[SDK] SDK status set to sdk_available');
        }
        
        // Only after SDK is fully initialized, start transaction polling
        console.log('[SDK] Setting up transactions polling');
        this.setUnsubscribeTransactionsPolling(
          this._rootStore.transactionsStore.listenToTransactions((transaction: ITransactionDTO) => {
            console.log(`[SDK] Transaction update received: ${transaction.id}`);
            this._rootStore.transactionsStore.addOrEditTransaction(transaction);
          }),
        );
        
        this.setIsMPCGenerating(false);
      }
    } catch (error: any) {
      console.error('[SDK] SDK initialization failed:', error);
      this.setIsMPCGenerating(false);
      this.setSDKStatus('sdk_initialization_failed');
      throw new Error(error.message);
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
  public setIsKeysExportInProcess(isExportInProcess: boolean): void {
    this.isKeysExportInProcess = isExportInProcess;
  }

  @action
  public setExportedKeys(keys: IFullKey[] | null): void {
    this.exportedKeys = keys;
  }

  @action
  public setFPRVKey(key: IFullKey): void {
    this.fprvKey = key ? key.privateKey : null;
  }

  @action
  public setXPRVKey(key: IFullKey): void {
    this.xprvKey = key ? key.privateKey : null;
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
  public async generateMPCKeys(): Promise<void> {
    if (!this.sdkInstance) {
      console.error('[SDK] generateMPCKeys: SDK not initialized');
      this.setError('fireblocksNCW is not initialized');
    } else {
      console.log('[SDK] Starting MPC keys generation...');
      this.setIsMPCReady(false);
      this.setIsMPCGenerating(true);
      const ALGORITHMS = new Set<TMPCAlgorithm>(['MPC_CMP_ECDSA_SECP256K1', 'MPC_CMP_EDDSA_ED25519']);
      try {
        console.log('[SDK] Generating MPC keys with algorithms:', Array.from(ALGORITHMS));
        await this.sdkInstance.generateMPCKeys(ALGORITHMS);
        console.log('[SDK] MPC keys generation successful');
        this.setIsMPCReady(true);
      } catch (error: any) {
        console.error('[SDK] MPC keys generation failed:', error);
        throw new Error(error.message);
      } finally {
        this.setIsMPCGenerating(false);
      }
    }
  }

  public async checkMPCKeys() {
    if (!this.sdkInstance) {
      console.error('[SDK] checkMPCKeys: SDK not initialized');
      this.setError('fireblocksNCW is not initialized');
    } else {
      console.log('[SDK] Checking MPC keys status...');
      this.setIsMPCReady(false);
      this.setIsMPCGenerating(true);
      const keysStatus = await this.sdkInstance.getKeysStatus();
      console.log('[SDK] MPC keys status:', keysStatus);

      const secP256K1Status = keysStatus.MPC_CMP_ECDSA_SECP256K1?.keyStatus ?? null;
      const ed25519Status = keysStatus.MPC_CMP_EDDSA_ED25519?.keyStatus ?? null;
      console.log('[SDK] SECP256K1 status:', secP256K1Status, 'ED25519 status:', ed25519Status);

      if (secP256K1Status === 'READY' || ed25519Status === 'READY') {
        console.log('[SDK] MPC is ready');
        this.setIsMPCReady(true);
      } else {
        console.log('[SDK] MPC is not ready');
        this.setIsMPCReady(false);
      }
      this.setIsMPCGenerating(false);
    }
  }

  public async takeover() {
    if (!this.sdkInstance) {
      console.error('[SDK] takeover: SDK not initialized');
      this.setError('fireblocksNCW is not initialized');
    } else {
      console.log('[SDK] Starting key takeover process...');
      this.setIsKeysExportInProcess(true);
      try {
        const keys = await this.sdkInstance.takeover();
        console.log('[SDK] Key takeover successful, keys:', keys.length);
        this.setExportedKeys(keys);
        const EDDSAKey = keys.find((k) => k.algorithm === 'MPC_CMP_EDDSA_ED25519');
        if (EDDSAKey) {
          console.log('[SDK] Found EDDSA key');
          this.setFPRVKey(EDDSAKey);
        }
        const ECDSAKey = keys.find((k) => k.algorithm === 'MPC_CMP_ECDSA_SECP256K1');
        if (ECDSAKey) {
          console.log('[SDK] Found ECDSA key');
          this.setXPRVKey(ECDSAKey);
        }
      } catch (error: any) {
        console.error('[SDK] Key takeover failed:', error);
        throw new Error(error.message);
      } finally {
        this.setIsKeysExportInProcess(false);
      }
    }
  }

  public deriveAssetKey(
    extendedPrivateKey: string,
    coinType: number,
    account: number,
    change: number,
    index: number,
  ): string {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
      return '';
    } else {
      return this.sdkInstance.deriveAssetKey(extendedPrivateKey, coinType, account, change, index);
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

  @action
  public clearData() {
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
