import { assignDeviceToNewWallet, generateNewDeviceId, getOrGenerateDeviceId } from '@api';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class DeviceStore {
  @observable public deviceId: string;
  @observable public walletId: string;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.deviceId = '';
    this.walletId = '';

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public init(): void {
    this.deviceId = getOrGenerateDeviceId(this._rootStore.userStore.userId);
  }

  @action
  public setDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
  }

  @action
  public setWalletId(walletId: string): void {
    this.walletId = walletId;
  }

  @action
  public generateNewDeviceId(): void {
    this.deviceId = generateNewDeviceId(this._rootStore.userStore.userId);
  }

  public async assignDeviceToNewWallet(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accessToken) {
      const newWalletId = await assignDeviceToNewWallet(deviceId, accessToken);
      this.setWalletId(newWalletId);
    }
  }
}
