import { TPassphraseLocation, saveDeviceIdToLocalStorage } from '@api';
import { RootStore } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';

export class LoginVM {
  @observable public generatingKeys: boolean;
  @observable public recoveringKeys: boolean;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.generatingKeys = false;
    this.recoveringKeys = false;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public setGeneratingKeys(value: boolean): void {
    this.generatingKeys = value;
  }

  @action
  public setRecoveringKeys(value: boolean): void {
    this.recoveringKeys = value;
  }

  @computed
  public get preparingWorkspace(): boolean {
    const { userStore, fireblocksSDKStore } = this._rootStore;

    if (this.deviceIdIsNotAvailable) {
      return false;
    }

    if (this.generatingKeys || this.recoveringKeys) {
      return true;
    }

    return (
      !userStore.storeIsReady ||
      (userStore.loggedUser && !fireblocksSDKStore.sdkInstance) ||
      fireblocksSDKStore.isMPCGenerating
    );
  }

  @computed
  public get needToGenerateKeys(): boolean {
    const { userStore, fireblocksSDKStore } = this._rootStore;

    if (this.deviceIdIsNotAvailable) {
      return true;
    }

    return !!(
      userStore.loggedUser &&
      fireblocksSDKStore.sdkInstance &&
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
      this.setGeneratingKeys(true);
      this._rootStore.deviceStore.generateNewDeviceId();
      await this._rootStore.deviceStore.assignDeviceToNewWallet();
      await this._rootStore.accountsStore.init();
      await this._rootStore.fireblocksSDKStore.init();
      this._rootStore.fireblocksSDKStore.generateMPCKeys();
    } catch (error: any) {
      this.setGeneratingKeys(false);
      throw new Error(error.message);
    } finally {
      this.setGeneratingKeys(false);
    }
  }

  public async recoverMPCKeys(location: TPassphraseLocation): Promise<void> {
    try {
      this.setRecoveringKeys(true);
      const deviceInfo = this._rootStore.userStore.myLatestActiveDevice;
      if (deviceInfo) {
        try {
          this._rootStore.deviceStore.setDeviceId(deviceInfo.deviceId);
          saveDeviceIdToLocalStorage(deviceInfo.deviceId, this._rootStore.userStore.userId);
          await this.startRecovery(location);
        } catch (error) {
          throw new Error('Error while starting recovery process.');
        } finally {
          this.setRecoveringKeys(false);
        }
      }
    } catch (error: any) {
      this.setRecoveringKeys(false);
      throw new Error(error.message);
    } finally {
      this.setRecoveringKeys(false);
    }
  }

  public async startRecovery(location: TPassphraseLocation): Promise<void> {
    await this._rootStore.deviceStore.assignDeviceToNewWallet();
    await this._rootStore.accountsStore.init();
    await this._rootStore.fireblocksSDKStore.init();
    await this._rootStore.backupStore.init();
    await this._rootStore.backupStore.recoverKeyBackup(location);
  }
}
