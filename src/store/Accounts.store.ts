import { IAccountDTO, getAccounts } from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { AccountStore } from './Account.store';
import { RootStore } from './Root.store';

export class AccountsStore {
  @observable public accounts: AccountStore[];

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.accounts = [];
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

  @computed
  public get currentAccount(): AccountStore | undefined {
    return this.accounts.length > 0 ? this.accounts[0] : undefined;
  }
}
