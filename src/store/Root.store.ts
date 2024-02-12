import { makeObservable, observable } from 'mobx';
import { UserStore } from './User.store';

export class RootStore {
  @observable public userStore: UserStore;

  constructor() {
    this.userStore = new UserStore();

    makeObservable(this);
  }
}
