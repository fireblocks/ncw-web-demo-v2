import { TPassphraseLocation, getDeviceIdFromLocalStorage, saveDeviceIdToLocalStorage } from '@api';
import { RootStore } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';
import { ENV_CONFIG } from '../env_config.ts';

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
    const savedDeviceId = getDeviceIdFromLocalStorage(this._rootStore.userStore.userId);
    if (savedDeviceId) {
      await this._automaticLogin();
    }
  }

  private async _automaticLogin(): Promise<void> {
    try {
      console.log('[Auth] Starting automatic login process');
      this.setStatus('LOGGING_IN');

      this._rootStore.deviceStore.init();

      // Initialize device
      console.log('[Auth] Initializing device');
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
        // Initialize the embedded wallet SDK
        console.log('[Auth] Initializing embedded wallet SDK');
        await this._rootStore.fireblocksSDKStore.initEmbeddedWalletProcess();
        console.log('[Auth] Embedded wallet SDK initialized successfully');
      }
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.accountsStore.init();

      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
        console.log('[Auth] Using embedded wallet SDK');
        try {
          // After initialization, check if we need to generate keys
          if (!this._rootStore.fireblocksSDKStore.isMPCReady) {
            console.log('[Auth] Embedded wallet SDK initialized but MPC not ready, generating keys...');
            try {
              await this._rootStore.fireblocksSDKStore.generateMPCKeys();
              console.log('[Auth] MPC keys generated successfully');
            } catch (keyGenError) {
              console.error('[Auth] Error generating MPC keys:', keyGenError);
              // Continue despite key generation errors
            }
          } else {
            console.log('[Auth] MPC keys are already ready');
          }

          // Ensure account exists
          try {
            console.log('[Auth] Ensuring account exists');
            await this._rootStore.accountsStore.init();
          } catch (accountError) {
            console.error('[Auth] Error fetching accounts:', accountError);
            // Continue despite account fetching errors
          }

          // Start transaction polling
          try {
            if (
              this._rootStore.fireblocksSDKStore.isMPCReady &&
              !this._rootStore.transactionsStore._hasTransactionsActivePollingForCurrentDevice) {
              console.log('[Auth] Starting transaction polling');
              await this._rootStore.transactionsStore.startPollingTransactions();
            }
          } catch (pollingError) {
            console.error('[Auth] Error starting transaction polling:', pollingError);
            // Continue despite polling errors
          }

          // Always set status to READY for embedded wallet so the app can proceed
          this.setStatus('READY');
        } catch (error) {
          console.error('[Auth] Error with embedded wallet SDK setup:', error);
          // Always set status to READY for embedded wallet so the app can proceed
          this.setStatus('READY');
        }
      } else {
        console.log('[Auth] Using regular Fireblocks SDK');
        try {
          await this._rootStore.fireblocksSDKStore.init();
          console.log('[Auth] Fireblocks SDK initialized successfully');
          this.setStatus('READY');
        } catch (error) {
          console.error('[Auth] Error initializing Fireblocks SDK:', error);
          this.setStatus('ERROR');
          throw new Error('Error initializing Fireblocks SDK');
        }
      }
    } catch (error) {
      console.error('[Auth] Error during automatic login:', error);
      // Only set ERROR status if we're not using embedded wallet SDK
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK !== 'true') {
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

  @computed
  public get deviceIdIsNotAvailable(): boolean {
    const { userStore, deviceStore } = this._rootStore;

    return !!(userStore.loggedUser && !deviceStore.deviceId);
  }

  public async generateMPCKeys(): Promise<void> {
    try {
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
        // Initialize the SDK if it's not already initialized
        if (!this._rootStore.fireblocksSDKStore.fireblocksEW) {
          console.log('[Auth] Initializing embedded wallet SDK');
          try {
            await this._rootStore.fireblocksSDKStore.init();
          } catch (initError) {
            console.error('[Auth] Error initializing embedded wallet SDK:', initError);
            // Continue despite initialization errors
          }
        }
        console.log('[Auth] Starting MPC key generation process');
        this.setStatus('GENERATING');
        // Create a new device ID if needed
        if (!this._rootStore.deviceStore.deviceId) {
          console.log('[Auth] Generating new device ID');
          this._rootStore.deviceStore.generateNewDeviceId();
        }
        // Assign device to wallet
        console.log('[Auth] Assigning device to wallet');
        await this._rootStore.deviceStore.assignDeviceToNewWallet();
        await this._rootStore.accountsStore.init();
        console.log('[Auth] Generating MPC keys with embedded wallet SDK');


        // Generate MPC keys
        if (this._rootStore.fireblocksSDKStore.sdkInstance) {
          console.log('[Auth] Generating MPC keys');
          try {
            await this._rootStore.fireblocksSDKStore.generateMPCKeys();
            console.log('[Auth] MPC keys generated successfully');
          } catch (keyGenError) {
            console.error('[Auth] Error generating MPC keys:', keyGenError);
            // Continue despite key generation errors
          }
        }

        // Ensure account exists
        try {
          console.log('[Auth] Ensuring account exists');
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
            console.log('[Auth] Starting transaction polling');
            await this._rootStore.transactionsStore.startPollingTransactions();
          }
        } catch (pollingError) {
          console.error('[Auth] Error starting transaction polling:', pollingError);
          // Continue despite polling errors
        }

        // Always set status to READY for embedded wallet
        this.setStatus('READY');
      } else {
        this.setStatus('GENERATING');
        this._rootStore.deviceStore.generateNewDeviceId();
        await this._rootStore.deviceStore.assignDeviceToNewWallet();
        await this._rootStore.accountsStore.init();
        await this._rootStore.fireblocksSDKStore.init();
        await this._rootStore.fireblocksSDKStore.generateMPCKeys();
      }
      this.setStatus('READY');
    } catch (error: any) {
      this.setStatus('ERROR');
      throw new Error(error.message);
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
      await this._rootStore.fireblocksSDKStore.init();
      await this._rootStore.backupStore.init();
      await this._rootStore.backupStore.recoverKeyBackup(location);
      this.setStatus('READY');
    } catch (error: any) {
      this.setStatus('ERROR');
      throw new Error(error.message);
    }
  }
}
