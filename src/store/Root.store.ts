import { makeObservable, observable } from 'mobx';
import { AccountsStore } from './Accounts.store';
import { AssetsStore } from './Assets.store';
import { DeviceStore } from './Device.store';
import { TransactionsStore } from './Transactions.store';
import { UserStore } from './User.store';

export class RootStore {
  @observable public userStore: UserStore;
  @observable public deviceStore: DeviceStore;
  @observable public assetsStore: AssetsStore;
  @observable public accountsStore: AccountsStore;
  @observable public transactionsStore: TransactionsStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.deviceStore = new DeviceStore(this);
    this.assetsStore = new AssetsStore(this);
    this.accountsStore = new AccountsStore(this);
    this.transactionsStore = new TransactionsStore(this);

    makeObservable(this);
  }
}
