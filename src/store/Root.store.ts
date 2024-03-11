import { makeObservable, observable } from 'mobx';
import { AccountsStore } from './Accounts.store';
import { AssetsStore } from './Assets.store';
import { DeviceStore } from './Device.store';
import { FireblocksSDKStore } from './FireblocksSDK.store';
import { NFTStore } from './NFT.store';
import { TransactionsStore } from './Transactions.store';
import { UserStore } from './User.store';

export class RootStore {
  @observable public userStore: UserStore;
  @observable public deviceStore: DeviceStore;
  @observable public assetsStore: AssetsStore;
  @observable public accountsStore: AccountsStore;
  @observable public transactionsStore: TransactionsStore;
  @observable public fireblocksSDKStore: FireblocksSDKStore;
  @observable public nftStore: NFTStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.deviceStore = new DeviceStore(this);
    this.assetsStore = new AssetsStore(this);
    this.accountsStore = new AccountsStore(this);
    this.transactionsStore = new TransactionsStore(this);
    this.fireblocksSDKStore = new FireblocksSDKStore(this);
    this.nftStore = new NFTStore(this);

    makeObservable(this);
  }
}
