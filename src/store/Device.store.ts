import { getOrGenerateDeviceId } from '@api';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class DeviceStore {
  @observable public deviceId: string;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.deviceId = '';
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
}
