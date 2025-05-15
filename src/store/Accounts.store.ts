import { IAccountDTO, getAccounts } from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { ENV_CONFIG } from '../env_config.ts';
import { AccountStore } from './Account.store';
import { RootStore } from './Root.store';

/**
 * AccountsStore manages a collection of accounts in the system.
 * It provides methods for initializing, adding, and accessing accounts.
 */
export class AccountsStore {
  /** Collection of account stores managed by this store */
  @observable public accounts: AccountStore[];

  /** Reference to the root store for accessing other stores */
  private _rootStore: RootStore;

  /**
   * Initializes the AccountsStore with a reference to the root store
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.accounts = [];

    this._rootStore = rootStore;

    makeObservable(this);
  }

  /**
   * Initializes the accounts by fetching them from the API
   * If no accounts are found and embedded wallet SDK is enabled, creates a new account
   */
  @action
  public async init(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId) {
      console.log('Accounts store init');
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const myAccounts = await getAccounts(deviceId, accessToken, this._rootStore);
      if (!myAccounts?.length && ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
        console.log('No accounts found, creating new account');
        const fireblocksEW = this._rootStore.fireblocksSDKStore.fireblocksEW;
        if (!fireblocksEW) {
          throw new Error('Fireblocks Embedded Wallet is not initialized');
        }
        const newAccount = await fireblocksEW.createAccount();
        console.log('newAccount: ', newAccount);
        this.addAccount(newAccount);
      } else {
        console.log('Found accounts: ', myAccounts);
        myAccounts.map((a: IAccountDTO) => {
          this.addAccount(a);
        });
      }
    }
  }

  /**
   * Adds a new account to the collection
   * @param dto The account data transfer object to create an account from
   */
  @action
  public addAccount(dto: IAccountDTO): void {
    const accountStore = new AccountStore(dto, this._rootStore);

    runInAction(() => {
      this.accounts.push(accountStore);
    });
  }

  /**
   * Gets the current active account (defaults to the first account)
   * @returns The current account or undefined if no accounts exist
   */
  @computed
  public get currentAccount(): AccountStore | undefined {
    return this.accounts.length > 0 ? this.accounts[0] : undefined;
  }
}
