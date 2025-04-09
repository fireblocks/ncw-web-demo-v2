import { TPassphraseLocation, getDeviceIdFromLocalStorage, saveDeviceIdToLocalStorage } from '@api';
import { RootStore } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';
import { ENV_CONFIG } from '../env_config';

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
      console.log('[Auth] Found saved device ID, performing automatic login');
      await this._automaticLogin();
    } else {
      console.log('[Auth] No saved device ID found');
    }
  }

  private async _automaticLogin(): Promise<void> {
    try {
      console.log('[Auth] Starting automatic login process');
      this.setStatus('LOGGING_IN');
      
      // Initialize device
      this._rootStore.deviceStore.init();
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.accountsStore.init();
      
      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        console.log('[Auth] Using embedded wallet SDK');
        try {
          await this._rootStore.embeddedWalletSDKStore.init();
          console.log('[Auth] Embedded wallet SDK initialized successfully');
          
          // After initialization, check if we need to generate keys
          if (!this._rootStore.embeddedWalletSDKStore.isMPCReady) {
            console.log('[Auth] Embedded wallet SDK initialized but MPC not ready, generating keys...');
            await this._rootStore.embeddedWalletSDKStore.generateMPCKeys();
            console.log('[Auth] MPC keys generated successfully');
          } else {
            console.log('[Auth] MPC keys are already ready');
          }
          
          // Set status to READY even if key generation failed, as we can try again later
          this.setStatus('READY');
        } catch (error) {
          console.error('[Auth] Error with embedded wallet SDK setup:', error);
          // Don't set ERROR status here, as it blocks UI flow
          // Just log the error and allow user to continue
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
      this.setStatus('ERROR');
      throw new Error('Error while starting automatic login process.');
    }
  }

  @action
  public setStatus(status: TStatus): void {
    console.log(`[Auth] Setting status: ${status}`);
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

      if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        console.log('[Auth] Generating MPC keys with embedded wallet SDK');
        try {
          // Initialize the SDK if it's not already initialized
          if (!this._rootStore.embeddedWalletSDKStore.sdkInstance) {
            console.log('[Auth] Initializing embedded wallet SDK');
            await this._rootStore.embeddedWalletSDKStore.init();
          }
          
          // Generate MPC keys
          console.log('[Auth] Generating MPC keys');
          await this._rootStore.embeddedWalletSDKStore.generateMPCKeys();
          console.log('[Auth] MPC keys generated successfully');
          
          this.setStatus('READY');
        } catch (error) {
          console.error('[Auth] Error generating MPC keys with embedded wallet SDK:', error);
          // Don't set error status - let the app continue functioning
          this.setStatus('READY');
        }
      } else {
        console.log('[Auth] Generating MPC keys with regular Fireblocks SDK');
        await this._rootStore.fireblocksSDKStore.init();
        await this._rootStore.fireblocksSDKStore.generateMPCKeys();
        this.setStatus('READY');
      }
    } catch (error: any) {
      console.error('[Auth] Error generating MPC keys:', error);
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
