import { makeObservable, observable } from 'mobx';
import { UserStore } from './User.store';
import { DeviceStore } from './Device.store';

export class RootStore {
  @observable public userStore: UserStore;
  @observable public deviceStore: DeviceStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.deviceStore = new DeviceStore(this);

    makeObservable(this);
  }
}
