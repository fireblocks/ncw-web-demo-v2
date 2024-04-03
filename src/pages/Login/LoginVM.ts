import { RootStore } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';

export class LoginVM {
  @observable public generatingKeys: boolean;

  constructor(private _rootStore: RootStore) {
    this.generatingKeys = false;

    makeObservable(this);
  }

  @action
  public setGeneratingKeys(value: boolean): void {
    this.generatingKeys = value;
  }

  @computed
  public get preparingWorkspace(): boolean {
    const { userStore, fireblocksSDKStore } = this._rootStore;

    if (this.deviceIdIsNotAvailable) {
      return false;
    }

    if (this.generatingKeys) {
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
}
