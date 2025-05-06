import { makeObservable, observable } from 'mobx';
import { AccountsStore } from './Accounts.store';
import { AssetsStore } from './Assets.store';
import { AuthStore } from './Auth.store';
import { BackupStore } from './Backup.store';
import { DeviceStore } from './Device.store';
import { FireblocksSDKStore } from './FireblocksSDK.store';
import { NFTStore } from './NFT.store';
import { TransactionsStore } from './Transactions.store';
import { UserStore } from './User.store';
import { Web3Store } from './Web3.store';

/**
 * RootStore serves as the main store that instantiates and holds references to all other stores.
 * It acts as a central hub for state management across the application.
 */
export class RootStore {
  /** Store for managing user-related state and operations */
  @observable public userStore: UserStore;

  /** Store for managing device-related state and operations */
  @observable public deviceStore: DeviceStore;

  /** Store for managing assets-related state and operations */
  @observable public assetsStore: AssetsStore;

  /** Store for managing accounts-related state and operations */
  @observable public accountsStore: AccountsStore;

  /** Store for managing transactions-related state and operations */
  @observable public transactionsStore: TransactionsStore;

  /** Store for managing Fireblocks SDK state and operations */
  @observable public fireblocksSDKStore: FireblocksSDKStore;

  /** Store for managing NFT-related state and operations */
  @observable public nftStore: NFTStore;

  /** Store for managing backup and recovery operations */
  @observable public backupStore: BackupStore;

  /** Store for managing authentication state and operations */
  @observable public authStore: AuthStore;

  /** Store for managing Web3 connections */
  @observable public web3Store: Web3Store;

  /**
   * Initializes the RootStore and creates instances of all child stores
   */
  constructor() {
    this.userStore = new UserStore(this);
    this.deviceStore = new DeviceStore(this);
    this.accountsStore = new AccountsStore(this);
    this.fireblocksSDKStore = new FireblocksSDKStore(this);
    this.assetsStore = new AssetsStore(this);
    this.backupStore = new BackupStore(this);
    this.transactionsStore = new TransactionsStore(this);
    this.nftStore = new NFTStore(this);
    this.authStore = new AuthStore(this);
    this.web3Store = new Web3Store(this);

    makeObservable(this);
  }
}
