import {
  TPassphraseLocation,
  generateNewDeviceId,
  getDeviceIdFromLocalStorage,
  saveDeviceIdToLocalStorage,
} from '@api';
import { RootStore } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';
import { ENV_CONFIG } from '../env_config.ts';

type TStatus = 'GENERATING' | 'RECOVERING' | 'READY' | 'ERROR' | 'LOGGING_IN' | null;

/**
 * AuthStore manages authentication, device ID management, and MPC key operations.
 * It handles the initialization of the wallet, automatic login, key generation,
 * and recovery processes for the application.
 */
export class AuthStore {
  @observable public status: TStatus;
  @observable public capturedRequestId: string; // join existing wallet, requestId

  private _rootStore: RootStore;

  /**
   * Initializes the AuthStore with a reference to the root store
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.status = null;
    this.capturedRequestId = '';

    this._rootStore = rootStore;

    makeObservable(this);
  }

  /**
   * Initializes the authentication process
   * Checks for a saved device ID and performs automatic login if available,
   * otherwise initializes the Fireblocks SDK
   */
  @action
  public async init(): Promise<void> {
    const savedDeviceId = getDeviceIdFromLocalStorage(this._rootStore.userStore.userId);
    if (savedDeviceId) {
      await this._automaticLogin();
    } else {
      await this._rootStore.fireblocksSDKStore.init();
    }
  }

  /**
   * Performs automatic login using the saved device ID
   * Initializes the device, SDK, and accounts, and starts transaction polling if needed
   * Sets the authentication status to READY when complete
   * @private
   */
  private async _automaticLogin(): Promise<void> {
    try {
      this.setStatus('LOGGING_IN');

      this._rootStore.deviceStore.init();

      // Initialize device
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && !this._rootStore.fireblocksSDKStore.fireblocksEW) {
        // Initialize the embedded wallet SDK
        await this._rootStore.fireblocksSDKStore.init();
      }
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.userStore.initializeAndSetupPushNotifications();
      await this._rootStore.accountsStore.init();

      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        try {
          // After initialization, check if we need to generate keys
          if (!this._rootStore.fireblocksSDKStore.isMPCReady) {
            try {
              await this._rootStore.fireblocksSDKStore.generateMPCKeys();
            } catch (keyGenError) {
              console.error('[Auth] Error generating MPC keys:', keyGenError);
              // Continue despite key generation errors
            }
          }

          // Start transaction polling
          try {
            if (
              this._rootStore.fireblocksSDKStore.isMPCReady &&
              !this._rootStore.transactionsStore._hasTransactionsActivePollingForCurrentDevice
            ) {
              await this._rootStore.transactionsStore.startPollingTransactions();
            }
          } catch (pollingError) {
            // Continue despite polling errors
          }

          // Always set status to READY for embedded wallet so the app can proceed
          this.setStatus('READY');
        } catch (error) {
          // Always set status to READY for embedded wallet so the app can proceed
          this.setStatus('READY');
        }
      } else {
        try {
          await this._rootStore.fireblocksSDKStore.init();
          this.setStatus('READY');
        } catch (error) {
          this.setStatus('ERROR');
          throw new Error('Error initializing Fireblocks SDK');
        }
      }
    } catch (error) {
      // Only set ERROR status if we're not using embedded wallet SDK
      if (!ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        this.setStatus('ERROR');
        throw new Error('Error while starting automatic login process.');
      } else {
        // For embedded wallet, set to READY so the app can proceed
        this.setStatus('READY');
      }
    }
  }

  /**
   * Updates the authentication status
   * @param status The new status to set
   */
  @action
  public setStatus(status: TStatus): void {
    this.status = status;
  }

  @action
  public setCapturedRequestId(requestId: string): void {
    this.capturedRequestId = requestId;
  }

  /**
   * Determines if the workspace is currently being prepared
   * This includes generating keys, recovering keys, logging in, or checking user/backup status
   * @returns True if the workspace is being prepared, false otherwise
   */
  @computed
  public get preparingWorkspace(): boolean {
    if (
      (this.status && ['GENERATING', 'RECOVERING', 'LOGGING_IN'].includes(this.status)) ||
      this._rootStore.userStore.isCheckingBackup ||
      this._rootStore.userStore.isGettingUser ||
      (!!this._rootStore.userStore.loggedUser && !this.needToGenerateKeys)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Determines if MPC keys need to be generated,
   * This is true if the device ID is not available or if the SDK is initialized
   * but keys are not yet generated or ready
   * @returns True if keys need to be generated, false otherwise
   */
  @computed
  public get needToGenerateKeys(): boolean {
    const { userStore, fireblocksSDKStore } = this._rootStore;

    if (this.deviceIdIsNotAvailable) {
      return true;
    }

    return (
      !!userStore.loggedUser &&
      !!fireblocksSDKStore.sdkInstance &&
      !fireblocksSDKStore.isMPCGenerating &&
      !fireblocksSDKStore.isMPCReady
    );
  }

  /**
   * Determines if the device ID is not available
   * This is true if the user is logged in but no device ID is set
   * @returns True if the device ID is not available, false otherwise
   */
  @computed
  public get deviceIdIsNotAvailable(): boolean {
    const { userStore, deviceStore } = this._rootStore;

    return !!(userStore.loggedUser && !deviceStore.deviceId);
  }

  public stopJoinWallet(): void {
    if (!this._rootStore.fireblocksSDKStore.sdkInstance) {
      throw new Error('fireblocksNCW is not initialized');
    }
    try {
      this._rootStore.fireblocksSDKStore.sdkInstance?.stopJoinWallet();
    } catch (error) {
      console.error('[Auth] Error stopping join wallet process: ', error);
    }
  }

  public async joinExistingWallet(): Promise<any> {
    try {
      // first get or set a deviceId
      const userID = this._rootStore.userStore.userId;
      let deviceId = prompt(
        'Enter device ID (leave empty for a random uuid)',
        this._rootStore.deviceStore.deviceId ?? '',
      );
      if (!deviceId?.length) {
        deviceId = generateNewDeviceId(userID);
      }
      this._rootStore.deviceStore.setDeviceId(deviceId);
      // init SDK Core
      await this._rootStore.fireblocksSDKStore.initEmbeddedWalletCore(deviceId);
      // request to join wallet
      if (!this._rootStore.fireblocksSDKStore.sdkInstance) {
        throw new Error('fireblocksNCW is not initialized');
      }
      let capturedRequestId: string | undefined;
      const response = await this._rootStore.fireblocksSDKStore.sdkInstance?.requestJoinExistingWallet({
        onRequestId(requestId: string) {
          capturedRequestId = requestId;
        },
      });

      if (!capturedRequestId) {
        throw new Error('Failed to obtain request ID');
      }

      if (capturedRequestId) {
        this.capturedRequestId = capturedRequestId;
      }

      // Set status to READY when we have a successful response
      if (response instanceof Set && response.size > 0) {
        const allItemsHaveKeyId = Array.from(response).every((item) => item.keyStatus === 'READY' && item.keyId !== '');

        if (allItemsHaveKeyId) {
          this.setStatus('READY');

          // Get walletId from the SDK and set it in the DeviceStore
          try {
            const assignResponse = await this._rootStore.fireblocksSDKStore.fireblocksEW?.assignWallet();
            if (assignResponse?.walletId) {
              this._rootStore.deviceStore.setWalletId(assignResponse.walletId);
            }

            // Initialize accounts to ensure accountId is available

            await this._rootStore.accountsStore.init();

            // Get devices to ensure walletId is available

            this._rootStore.userStore.getMyDevices();
          } catch (accountError) {
            console.error('[Auth] Error initializing accounts after joining wallet:', accountError);
            // Continue despite account initialization errors
          }
        }
      }

      return response;
    } catch (error: any) {
      console.error('[Auth] Error during join existing wallet process: ', error);
      this.setStatus('ERROR');
      throw new Error(error.message);
    }
  }

  /**
   * Generates MPC keys for the wallet
   * Initializes the SDK if needed, creates a device ID if needed,
   * assigns the device to a wallet, and generates the MPC keys
   * Also starts transaction polling if keys are successfully generated
   */
  public async generateMPCKeys(): Promise<void> {
    try {
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        // Initialize the SDK if it's not already initialized
        if (!this._rootStore.fireblocksSDKStore.fireblocksEW) {
          try {
            await this._rootStore.fireblocksSDKStore.init();
          } catch (initError) {
            console.error('[Auth] Error initializing embedded wallet SDK:', initError);
            // Continue despite initialization errors
          }
        }

        this.setStatus('GENERATING');
        // Create a new device ID if needed
        if (!this._rootStore.deviceStore.deviceId) {
          this._rootStore.deviceStore.generateNewDeviceId();
        }
        // Assign device to wallet

        await this._rootStore.deviceStore.assignDeviceToNewWallet();
        await this._rootStore.userStore.initializeAndSetupPushNotifications();
        await this._rootStore.accountsStore.init();

        // Generate MPC keys
        try {
          if (this._rootStore.fireblocksSDKStore.sdkInstance) {
            await this._rootStore.fireblocksSDKStore.generateMPCKeys();
          } else {
            if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
              await this._rootStore.fireblocksSDKStore.initEmbeddedWalletCore(this._rootStore.deviceStore.deviceId);
              await this._rootStore.fireblocksSDKStore.generateMPCKeys();
            }
          }
        } catch (e: any) {
          console.error('[Auth] Error generating MPC keys:', e);
        }

        // Ensure account exists
        try {
          await this._rootStore.accountsStore.init();
        } catch (accountError) {
          console.error('[Auth] Error fetching accounts:', accountError);
          // Continue despite account fetching errors
        }

        // Start transaction polling
        try {
          if (
            this._rootStore.fireblocksSDKStore.isMPCReady &&
            !this._rootStore.transactionsStore._hasTransactionsActivePollingForCurrentDevice
          ) {
            await this._rootStore.transactionsStore.startPollingTransactions();
          }
        } catch (pollingError) {
          console.error('[Auth] Error starting transaction polling:', pollingError);
          // Continue despite polling errors
        }

        // Always set status to READY for embedded wallet
        if (!this._rootStore.fireblocksSDKStore.isBackupPhase) {
          this.setStatus('READY');
        }
      } else {
        this.setStatus('GENERATING');
        this._rootStore.deviceStore.generateNewDeviceId();
        await this._rootStore.deviceStore.assignDeviceToNewWallet();
        await this._rootStore.userStore.initializeAndSetupPushNotifications();
        await this._rootStore.accountsStore.init();
        await this._rootStore.fireblocksSDKStore.init();
        await this._rootStore.fireblocksSDKStore.generateMPCKeys();
      }
      if (!this._rootStore.fireblocksSDKStore.isBackupPhase) {
        this.setStatus('READY');
      }
    } catch (error: any) {
      this.setStatus('ERROR');
      throw new Error(error.message);
    }
  }

  /**
   * Recovers MPC keys from a backup
   * @param location The location where the backup is stored (e.g., GoogleDrive, iCloud)
   */
  public async recoverMPCKeys(location: TPassphraseLocation, fromSettingPage = false): Promise<void> {
    try {
      const deviceInfo = this._rootStore.userStore.myLatestActiveDevice;
      if (deviceInfo) {
        try {
          this._rootStore.deviceStore.setDeviceId(deviceInfo.deviceId);
          saveDeviceIdToLocalStorage(deviceInfo.deviceId, this._rootStore.userStore.userId);
          await this._startRecovery(location, fromSettingPage);
        } catch (error) {
          this.setStatus('ERROR');
          throw new Error('Error while starting recovery process.');
        }
      }
    } catch (error: any) {
      this.setStatus('ERROR');
      throw new Error(error.message);
    }
  }

  /**
   * Starts the recovery process for MPC keys
   * Sets the status to RECOVERING and attempts to recover keys from the specified location
   * @param location The location where the backup is stored (e.g., GoogleDrive, iCloud)
   * @private
   */
  private async _startRecovery(location: TPassphraseLocation, fromSettingPage = false): Promise<void> {
    try {
      if (!fromSettingPage) {
        this.setStatus('RECOVERING');
      }
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.userStore.initializeAndSetupPushNotifications();
      await this._rootStore.accountsStore.init();
      await this._rootStore.fireblocksSDKStore.init();
      await this._rootStore.backupStore.init();
      await this._rootStore.backupStore.recoverKeyBackup(location);
      if (!fromSettingPage) {
        this.setStatus('READY');
      }
    } catch (error: any) {
      if (!fromSettingPage) {
        this.setStatus('ERROR');
      }
      throw new Error(error.message);
    }
  }
}
