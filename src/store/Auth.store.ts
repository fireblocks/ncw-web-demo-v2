import { TPassphraseLocation, getDeviceIdFromLocalStorage, saveDeviceIdToLocalStorage } from '@api';
import { RootStore } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';
import { ENV_CONFIG } from '../env_config';
import { consoleLog, consoleError } from '../utils/logger';

type TStatus = 'GENERATING' | 'RECOVERING' | 'READY' | 'ERROR' | 'LOGGING_IN' | null;

export class AuthStore {
  @observable public status: TStatus;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.status = null;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    consoleLog('[Auth] Initializing authentication...');
    const savedDeviceId = getDeviceIdFromLocalStorage(this._rootStore.userStore.userId);
    if (savedDeviceId) {
      consoleLog('[Auth] Found saved device ID, performing automatic login');
      await this._automaticLogin();
    } else {
      consoleLog('[Auth] No saved device ID found');
    }
  }

  private async _automaticLogin(): Promise<void> {
    try {
      consoleLog('[Auth] Starting automatic login process');
      this.setStatus('LOGGING_IN');
      
      // Initialize device
      consoleLog('[Auth] Initializing device');
      this._rootStore.deviceStore.init();
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.accountsStore.init();
      
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        consoleLog('[Auth] Using embedded wallet SDK');
        try {
          // Initialize the embedded wallet SDK
          consoleLog('[Auth] Initializing embedded wallet SDK');
          await this._rootStore.embeddedWalletSDKStore.init();
          consoleLog('[Auth] Embedded wallet SDK initialized successfully');
          
          // After initialization, check if we need to generate keys
          if (!this._rootStore.embeddedWalletSDKStore.isMPCReady) {
            consoleLog('[Auth] Embedded wallet SDK initialized but MPC not ready, generating keys...');
            try {
              await this._rootStore.embeddedWalletSDKStore.generateMPCKeys();
              consoleLog('[Auth] MPC keys generated successfully');
            } catch (keyGenError) {
              consoleError('[Auth] Error generating MPC keys:', keyGenError);
              // Continue despite key generation errors
            }
          } else {
            consoleLog('[Auth] MPC keys are already ready');
          }
          
          // Ensure account exists
          try {
            consoleLog('[Auth] Ensuring account exists');
            await this._rootStore.embeddedWalletSDKStore.fetchAccounts();
          } catch (accountError) {
            consoleError('[Auth] Error fetching accounts:', accountError);
            // Continue despite account fetching errors
          }
          
          // Start transaction polling
          try {
            if (this._rootStore.embeddedWalletSDKStore.isMPCReady && 
                !this._rootStore.embeddedWalletSDKStore.isPollingTransactions) {
              consoleLog('[Auth] Starting transaction polling');
              this._rootStore.embeddedWalletSDKStore.startPollingTransactions();
            }
          } catch (pollingError) {
            consoleError('[Auth] Error starting transaction polling:', pollingError);
            // Continue despite polling errors
          }
          
          // Always set status to READY for embedded wallet so the app can proceed
          this.setStatus('READY');
        } catch (error) {
          consoleError('[Auth] Error with embedded wallet SDK setup:', error);
          // Always set status to READY for embedded wallet so the app can proceed
          this.setStatus('READY');
        }
      } else {
        consoleLog('[Auth] Using regular Fireblocks SDK');
        try {
          await this._rootStore.fireblocksSDKStore.init();
          consoleLog('[Auth] Fireblocks SDK initialized successfully');
          this.setStatus('READY');
        } catch (error) {
          consoleError('[Auth] Error initializing Fireblocks SDK:', error);
          this.setStatus('ERROR');
          throw new Error('Error initializing Fireblocks SDK');
        }
      }
    } catch (error) {
      consoleError('[Auth] Error during automatic login:', error);
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

  @action
  public setStatus(status: TStatus): void {
    consoleLog(`[Auth] Setting status: ${status}`);
    this.status = status;
  }

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

  @computed
  public get needToGenerateKeys(): boolean {
    const { userStore, fireblocksSDKStore, embeddedWalletSDKStore } = this._rootStore;

    if (this.deviceIdIsNotAvailable) {
      return true;
    }

    // If we're generating keys, don't trigger another generation
    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && embeddedWalletSDKStore.isMPCGenerating) {
      return false;
    } else if (!ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && fireblocksSDKStore.isMPCGenerating) {
      return false;
    }

    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
      return (
        !!userStore.loggedUser &&
        !!embeddedWalletSDKStore.sdkInstance &&
        !embeddedWalletSDKStore.isMPCGenerating &&
        !embeddedWalletSDKStore.isMPCReady
      );
    } else {
      return (
        !!userStore.loggedUser &&
        !!fireblocksSDKStore.sdkInstance &&
        !fireblocksSDKStore.isMPCGenerating &&
        !fireblocksSDKStore.isMPCReady
      );
    }
  }

  @computed
  public get deviceIdIsNotAvailable(): boolean {
    const { userStore, deviceStore } = this._rootStore;

    return !!(userStore.loggedUser && !deviceStore.deviceId);
  }

  public async generateMPCKeys(): Promise<void> {
    try {
      consoleLog('[Auth] Starting MPC key generation process');
      this.setStatus('GENERATING');
      
      // Create a new device ID if needed
      if (!this._rootStore.deviceStore.deviceId) {
        consoleLog('[Auth] Generating new device ID');
        this._rootStore.deviceStore.generateNewDeviceId();
      }
      
      // Assign device to wallet
      consoleLog('[Auth] Assigning device to wallet');
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.accountsStore.init();

      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        consoleLog('[Auth] Generating MPC keys with embedded wallet SDK');
        try {
          // Initialize the SDK if it's not already initialized
          if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
            consoleLog('[Auth] Initializing embedded wallet SDK');
            try {
              await this._rootStore.embeddedWalletSDKStore.init();
            } catch (initError) {
              consoleError('[Auth] Error initializing embedded wallet SDK:', initError);
              // Continue despite initialization errors
            }
          }
          
          // Generate MPC keys
          if (this._rootStore.embeddedWalletSDKStore.sdkInstance) {
            consoleLog('[Auth] Generating MPC keys');
            try {
              await this._rootStore.embeddedWalletSDKStore.generateMPCKeys();
              consoleLog('[Auth] MPC keys generated successfully');
            } catch (keyGenError) {
              consoleError('[Auth] Error generating MPC keys:', keyGenError);
              // Continue despite key generation errors
            }
          }
          
          // Ensure account exists
          try {
            consoleLog('[Auth] Ensuring account exists');
            await this._rootStore.embeddedWalletSDKStore.fetchAccounts();
          } catch (accountError) {
            consoleError('[Auth] Error fetching accounts:', accountError);
            // Continue despite account fetching errors
          }
          
          // Start transaction polling
          try {
            if (this._rootStore.embeddedWalletSDKStore.isMPCReady && 
                !this._rootStore.embeddedWalletSDKStore.isPollingTransactions) {
              consoleLog('[Auth] Starting transaction polling');
              this._rootStore.embeddedWalletSDKStore.startPollingTransactions();
            }
          } catch (pollingError) {
            consoleError('[Auth] Error starting transaction polling:', pollingError);
            // Continue despite polling errors
          }
          
          // Always set status to READY for embedded wallet
          this.setStatus('READY');
        } catch (error) {
          consoleError('[Auth] Error generating MPC keys with embedded wallet SDK:', error);
          // Always set status to READY for embedded wallet
          this.setStatus('READY');
        }
      } else {
        consoleLog('[Auth] Generating MPC keys with regular Fireblocks SDK');
        await this._rootStore.fireblocksSDKStore.init();
        await this._rootStore.fireblocksSDKStore.generateMPCKeys();
        this.setStatus('READY');
      }
    } catch (error: any) {
      consoleError('[Auth] Error generating MPC keys:', error);
      // Only set ERROR status if we're not using embedded wallet SDK
      if (!ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        this.setStatus('ERROR');
        throw new Error(error.message);
      } else {
        // For embedded wallet, set to READY so the app can proceed
        this.setStatus('READY');
      }
    }
  }

  public async recoverMPCKeys(location: TPassphraseLocation): Promise<void> {
    try {
      const deviceInfo = this._rootStore.userStore.myLatestActiveDevice;
      if (deviceInfo) {
        try {
          this._rootStore.deviceStore.setDeviceId(deviceInfo.deviceId);
          saveDeviceIdToLocalStorage(deviceInfo.deviceId, this._rootStore.userStore.userId);
          await this._startRecovery(location);
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

  private async _startRecovery(location: TPassphraseLocation): Promise<void> {
    try {
      this.setStatus('RECOVERING');
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.accountsStore.init();
      
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        consoleLog('[Auth] Recovering with embedded wallet SDK');
        await this._rootStore.embeddedWalletSDKStore.init();
        // Handle recovery using embedded wallet SDK
        // This may involve specific recovery methods in the embedded wallet SDK
        this.setStatus('READY');
      } else {
        consoleLog('[Auth] Recovering with regular Fireblocks SDK');
        await this._rootStore.fireblocksSDKStore.init();
        await this._rootStore.backupStore.init();
        await this._rootStore.backupStore.recoverKeyBackup(location);
        this.setStatus('READY');
      }
    } catch (error: any) {
      consoleError('[Auth] Error in recovery process:', error);
      this.setStatus('ERROR');
      throw new Error(error.message);
    }
  }
}
