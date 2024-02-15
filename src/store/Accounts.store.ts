import { IAccountDTO, getAccounts } from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { AccountStore } from './Account.store';
import { RootStore } from './Root.store';

export class AccountsStore {
  @observable public accounts: AccountStore[];
  @observable public currentAccountId: number | null;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.accounts = [];
    this.currentAccountId = null;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    const myAccounts = await getAccounts(deviceId, accessToken);

    myAccounts.map((a) => {
      this.addAccount(a);
    });
  }

  @action
  public addAccount(dto: IAccountDTO): void {
    const accountStore = new AccountStore(dto, this._rootStore);

    runInAction(() => {
      this.accounts.push(accountStore);
    });
  }

  @action
  public setCurrentAccountId(accountId: number): void {
    this.currentAccountId = accountId;
  }

  @computed
  public get currentAccount(): AccountStore | undefined {
    return this.accounts.find((a) => a.data.accountId === this.currentAccountId);
  }
}
