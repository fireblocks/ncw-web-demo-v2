import { ITransactionDTO, TFireblocksNCWStatus, TKeysStatusRecord, sendMessage } from '@api';
import { EmbeddedWallet, ICoreOptions, IEmbeddedWalletOptions } from '@fireblocks/embedded-wallet-sdk';
import {
  BrowserLocalStorageProvider,
  ConsoleLoggerFactory,
  FireblocksNCWFactory,
  generateDeviceId,
  getFireblocksNCWInstance,
  IEventsHandler,
  IFireblocksNCW,
  IFullKey,
  IJoinWalletEvent,
  IKeyBackupEvent,
  IKeyDescriptor,
  IKeyRecoveryEvent,
  IMessagesHandler,
  TEnv,
  TEvent,
  TMPCAlgorithm,
} from '@fireblocks/ncw-js-sdk';
import {
  IndexedDBLogger,
  IndexedDBLoggerFactory,
  PasswordEncryptedLocalStorage,
  secureStorageProviderFactory,
} from '@services';
import { ENV_CONFIG } from 'env_config';
import { action, computed, makeObservable, observable } from 'mobx';
import { saveDeviceIdToLocalStorage } from '../api';
import { RootStore } from './Root.store';

const createSafeLogger = (baseLogger: any) => {
  const sanitizeData = (data: any) => {
    if (!data) return data;
    try {
      // This will throw an error for non-serializable objects
      JSON.stringify(data);
      return data;
    } catch (e) {
      // Return a simplified version of the object
      return { info: 'Data contained non-serializable objects (like XMLHttpRequest)' };
    }
  };

  return {
    debug: (message: string, data?: any) => baseLogger.debug(message, sanitizeData(data)),
    info: (message: string, data?: any) => baseLogger.info(message, sanitizeData(data)),
    warn: (message: string, data?: any) => baseLogger.warn(message, sanitizeData(data)),
    error: (message: string, data?: any) => baseLogger.error(message, sanitizeData(data)),
  };
};

/**
 * FireblocksSDKStore manages the integration with Fireblocks SDK.
 * It handles initialization of the SDK, MPC key generation and management,
 * wallet operations, and event handling for both embedded wallet and proxy backend modes.
 * This store is central to the wallet's cryptographic operations and security features.
 */
export class FireblocksSDKStore {
  @observable public sdkStatus: TFireblocksNCWStatus;
  @observable public keysStatus: TKeysStatusRecord | null;
  @observable public fireblocksEW: EmbeddedWallet | null;
  @observable public sdkInstance: IFireblocksNCW | null;
  @observable public keysBackupStatus: string;
  @observable public keysRecoveryStatus: string;
  @observable public joinWalletEventDescriptor: string;
  @observable public isMPCReady: boolean;
  @observable public isMPCGenerating: boolean;
  @observable public isBackupPhase: boolean;
  @observable public isKeysExportInProcess: boolean;
  @observable public exportedKeys: IFullKey[] | null;
  @observable public error: string;
  @observable public logger: IndexedDBLogger | null;
  @observable public fprvKey: string | null;
  @observable public xprvKey: string | null;

  private _rootStore: RootStore;
  private _unsubscribeTransactionsPolling: (() => void) | null;

  /**
   * Initializes the FireblocksSDKStore with default values and a reference to the root store
   * Sets up initial state for SDK status, keys, and other properties
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.sdkStatus = 'sdk_not_ready';
    this.keysStatus = null;
    this.fireblocksEW = null;
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
    this.isBackupPhase = false;

    this._unsubscribeTransactionsPolling = null;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  /**
   * Cleans up resources used by the SDK
   * Stops transaction polling, disposes the SDK instance, and resets state
   */
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

  /**
   * Initializes the embedded wallet process
   * Sets up the SDK with the embedded wallet configuration, initializes the logger,
   * and prepares the device ID for wallet operations
   */
  public async initEmbeddedWalletProcess(): Promise<void> {
    this.setIsMPCGenerating(true);
    this.setSDKInstance(null);
    this.setSDKStatus('initializing_sdk');

    console.log('initEmbeddedWalletProcess: initializing_sdk');
    try {
      // let deviceId = prompt(
      //   'Enter device ID (leave empty for a random uuid)',
      //   this._rootStore.deviceStore.deviceId ?? '',
      // );
      const deviceId = this._rootStore.deviceStore.deviceId ?? '';

      const logger = await IndexedDBLoggerFactory({
        deviceId: this._rootStore.deviceStore.deviceId ?? '',
        logger: ConsoleLoggerFactory(),
      });

      // Add a small delay to ensure the database connection is fully established
      await new Promise(resolve => setTimeout(resolve, 100));

      const ewOpts: IEmbeddedWalletOptions = {
        env: ENV_CONFIG.NCW_SDK_ENV as TEnv,
        logLevel: 'VERBOSE',
        logger,
        authClientId: ENV_CONFIG.AUTH_CLIENT_ID,
        authTokenRetriever: {
          getAuthToken: () => this._rootStore.userStore.getAccessToken(),
        },
        reporting: {
          enabled: false,
        },
      };
      this.fireblocksEW = new EmbeddedWallet(ewOpts);

      console.log('DeviceId: ', deviceId);
      if (!deviceId) {
        this._rootStore.userStore.getMyDevices(); // todo: we should initialize the sdk core first, but it also want deviceId
        this._rootStore.userStore.setIsGettingUser(false);
        // this._rootStore.userStore.setIsGettingUser(false);
        // const latestBackup = await this._rootStore.backupStore.getMyLatestBackup();
        // this._rootStore.backupStore.setLatestBackup(latestBackup);
        // if (latestBackup) {
        //   this._rootStore.userStore.setHasBackup(true);
        // } else {
        //   deviceId = generateDeviceId();
        //   await this.initEmbeddedWalletCore(deviceId);
        // }
      } else {
        await this.initEmbeddedWalletCore(deviceId);
        this._rootStore.userStore.getMyDevices(); // todo: we should initialize the sdk core first, but it also want deviceId
        this._rootStore.userStore.setIsGettingUser(false);
      }

    } catch (error: any) {
      this.setIsMPCGenerating(false);
      this.setSDKStatus('sdk_initialization_failed');
      throw new Error(error.message);
    }
  }

  /**
   * Initializes the core of the embedded wallet with a specific device ID
   * Sets up event handlers for key operations, wallet joining, and transactions
   * @param deviceId The device ID to use for initialization
   */
  public async initEmbeddedWalletCore(deviceId: string): Promise<void> {
    try {
      const eventsHandler: IEventsHandler = {
        handleEvent: (event: TEvent) => {
          switch (event.type) {
            case 'key_descriptor_changed':
              const _keysStatus: Record<TMPCAlgorithm, IKeyDescriptor> =
                this.keysStatus ?? ({} as Record<TMPCAlgorithm, IKeyDescriptor>);
              _keysStatus[event.keyDescriptor.algorithm] = event.keyDescriptor;
              console.log(`Key status: ${JSON.stringify(_keysStatus)}`);
              this.setKeysStatus(_keysStatus);
              /////
              // this.sdkInstance
              //   ?.getKeysStatus()
              //   .then((keyStatus) => {
              //     this.setKeysStatus(keyStatus);
              //   })
              //   .catch(() => {
              //     this.setError('fireblocksNCW failed to get key status');
              //   });
              break;
            case 'transaction_signature_changed':
              console.log(`Transaction signature status: ${event.transactionSignature.transactionSignatureStatus}`);
              //  this._rootStore.transactionsStore._refreshTransactions();
              this._rootStore.transactionsStore
                .getTransactionById(event.transactionSignature.txId)
                ?.updateSignatureStatus(event.transactionSignature.transactionSignatureStatus);
              break;
            case 'keys_backup':
              console.log(`Key backup status: ${JSON.stringify(event.keysBackup)}`);
              this.setKeysBackupStatus(JSON.stringify(event.keysBackup));
              this._rootStore.backupStore.getMyLatestBackup().catch((error) => {
                console.error('[EmbeddedWalletSDK] Error getting latest backup:', error);
              });
              break;
            case 'keys_recovery':
              console.log(`Key recover status: ${JSON.stringify(event.keyDescriptor)}`);
              this.setKeysRecoveryStatus(JSON.stringify(event.keyDescriptor));
              break;
            case 'join_wallet_descriptor':
              console.log(`join wallet event: ${JSON.stringify(event.joinWalletDescriptor)}`);
              if (event.joinWalletDescriptor?.requestId) {
                this._rootStore.authStore.setCapturedRequestId(event.joinWalletDescriptor?.requestId);
              }
              this.setJoinWalletEventDescriptor(JSON.stringify(event.joinWalletDescriptor));
              break;
          }
        },
      };
      this._rootStore.deviceStore.setDeviceId(deviceId);
      saveDeviceIdToLocalStorage(deviceId, this._rootStore.userStore.userId);
      const storageProvider = new BrowserLocalStorageProvider();
      const secureStorageProvider = new PasswordEncryptedLocalStorage(deviceId, () => {
        const password = prompt('Enter password', '');
        if (password === null) {
          return Promise.reject(new Error('Rejected by user'));
        }
        return Promise.resolve(password || '');
      });
      console.log('embedded wallet set logger: ', secureStorageProvider);

      // this.setLogger(logger);
      this.logger = await IndexedDBLoggerFactory({ deviceId, logger: ConsoleLoggerFactory() });

      // Add a small delay to ensure the database connection is fully established
      await new Promise(resolve => setTimeout(resolve, 100));

      const coreNCWOptions: ICoreOptions = {
        deviceId,
        eventsHandler,
        secureStorageProvider,
        storageProvider,
      };
      const sdkIns =
        getFireblocksNCWInstance(coreNCWOptions.deviceId) ?? (await this?.fireblocksEW?.initializeCore(coreNCWOptions));
      if (sdkIns) {
        this.setSDKInstance(sdkIns);
      }

      // const txSubscriber = await TransactionSubscriberService.initialize(this.fireblocksEW);

      this.setUnsubscribeTransactionsPolling(
        this._rootStore.transactionsStore.listenToTransactions((transaction: ITransactionDTO) => {
          this._rootStore.transactionsStore.addOrEditTransaction(transaction);
        }),
      );

      if (this.sdkInstance) {
        const keyStatus = await this.sdkInstance.getKeysStatus();
        console.log('embedded wallet keysStatus: ', keyStatus);
        if (Object.keys(keyStatus).length > 0) {
          this.setKeysStatus(keyStatus);
          this.setSDKStatus('sdk_available');
        }
        this.setIsMPCGenerating(false);
      }
      console.log('sdk_available');
      this.setSDKStatus('sdk_available');
    } catch (error: any) {
      this.setIsMPCGenerating(false);
      this.setSDKStatus('sdk_initialization_failed');
      throw new Error(error.message);
    }
  }

  /**
   * Initializes the SDK using the proxy backend process
   * Sets up message handlers, event handlers, and initializes the SDK with proxy backend configuration
   * This is used when not using the embedded wallet mode
   */
  public async initWithProxyBackendProcess(): Promise<void> {
    this.setIsMPCGenerating(true);
    this.setSDKInstance(null);
    this.setSDKStatus('initializing_sdk');

    console.log('initWithProxyBackendProcess: initializing_sdk');
    try {
      const messagesHandler: IMessagesHandler = {
        handleOutgoingMessage: (message: string) => {
          if (!this._rootStore.deviceStore.deviceId) {
            throw new Error('deviceId is not set');
          }
          return sendMessage(
            this._rootStore.deviceStore.deviceId,
            this._rootStore.userStore.accessToken,
            message,
            // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
            this._rootStore,
          );
        },
      };

      const eventsHandler: IEventsHandler = {
        handleEvent: (event: TEvent) => {
          switch (event.type) {
            case 'key_descriptor_changed':
              this.sdkInstance
                ?.getKeysStatus()
                .then((keyStatus) => {
                  this.setKeysStatus(keyStatus);
                })
                .catch(() => {
                  this.setError('fireblocksNCW failed to get key status');
                });
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

      // Add a small delay to ensure the database connection is fully established
      await new Promise(resolve => setTimeout(resolve, 100));

      let fireblocksNCW: IFireblocksNCW | null = null;

      const ncwInstance = getFireblocksNCWInstance(this._rootStore.deviceStore.deviceId);
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

      this.setLogger(logger);
      this.setSDKInstance(fireblocksNCW);

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
    } catch (error: any) {
      this.setIsMPCGenerating(false);
      this.setSDKStatus('sdk_initialization_failed');
      throw new Error(error);
    }
  }

  /**
   * Initializes the SDK based on the configuration
   * Calls either initEmbeddedWalletProcess or initWithProxyBackendProcess
   * depending on the USE_EMBEDDED_WALLET_SDK environment variable
   */
  @action
  public async init() {
    console.log('ENV_CONFIG.USE_EMBEDDED_WALLET_SDK: ', ENV_CONFIG.USE_EMBEDDED_WALLET_SDK);
    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
      await this.initEmbeddedWalletProcess();
    } else {
      await this.initWithProxyBackendProcess();
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

  /**
   * Generates MPC keys for the wallet
   * Checks if keys are already generated, and if not, generates new keys
   * for both ECDSA and EDDSA algorithms
   * @throws Error if the SDK is not initialized or key generation fails
   */
  @action
  public async generateMPCKeys(): Promise<void> {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
    } else {
      await this.checkMPCKeys();
      if (this.isMPCReady) {
        console.log('// @@@ DEBUGS: MPC keys are already generated');
        return;
      }
      this.setIsMPCReady(false);
      this.setIsMPCGenerating(true);
      const ALGORITHMS = new Set<TMPCAlgorithm>(['MPC_CMP_ECDSA_SECP256K1', 'MPC_CMP_EDDSA_ED25519']);
      try {
        const started = Date.now();
        await this.sdkInstance.generateMPCKeys(ALGORITHMS);
        console.log(`// @@@ DEBUGS: took ${Date.now() - started}ms to generate keys`);
        this.setIsMPCReady(true);

        // Update keysStatus after generating MPC keys
        const keyStatus = await this.sdkInstance.getKeysStatus();
        if (Object.keys(keyStatus).length > 0) {
          this.setKeysStatus(keyStatus);
        }
      } catch (error: any) {
        throw new Error(error.message);
      } finally {
        this.setIsMPCGenerating(false);
      }
    }
  }

  /**
   * Checks if MPC keys are already generated and available
   * Updates the isMPCReady state based on the check result
   * @throws Error if the SDK is not initialized
   */
  public async checkMPCKeys() {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
    } else {
      this.setIsMPCReady(false);
      this.setIsMPCGenerating(true);
      const keysStatus = await this.sdkInstance.getKeysStatus();

      // Update keysStatus to ensure keysAreReady is updated correctly
      if (Object.keys(keysStatus).length > 0) {
        this.setKeysStatus(keysStatus);
      }

      const secP256K1Status = keysStatus.MPC_CMP_ECDSA_SECP256K1?.keyStatus ?? null;
      const ed25519Status = keysStatus.MPC_CMP_EDDSA_ED25519?.keyStatus ?? null;

      console.log('// @@@ DEBUGS: MPC keys status secP256K1Status: ', secP256K1Status);
      console.log('// @@@ DEBUGS: MPC keys status ed25519Status: ', ed25519Status);
      if (secP256K1Status === 'READY' || ed25519Status === 'READY') {
        console.log('// @@@ DEBUGS: MPC keys are already generated');
        this.setIsMPCReady(true);
      } else {
        this.setIsMPCReady(false);
      }
      this.setIsMPCGenerating(false);
    }
  }

  public async takeover() {
    if (!this.sdkInstance) {
      this.setError('fireblocksNCW is not initialized');
    } else {
      this.setIsKeysExportInProcess(true);
      try {
        const keys = await this.sdkInstance.takeover();
        this.setExportedKeys(keys);
        const EDDSAKey = keys.find((k) => k.algorithm === 'MPC_CMP_EDDSA_ED25519');
        if (EDDSAKey) {
          this.setFPRVKey(EDDSAKey);
        }
        const ECDSAKey = keys.find((k) => k.algorithm === 'MPC_CMP_ECDSA_SECP256K1');
        if (ECDSAKey) {
          this.setXPRVKey(ECDSAKey);
        }
      } catch (error: any) {
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

  @action
  public backupPhase(isBackupPage: boolean) {
    this.isBackupPhase = isBackupPage;
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
