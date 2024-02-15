import { ITransactionDTO, getTransactions } from '@api';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from './Root.store';
import { TransactionStore } from './Transaction.store';

export class TransactionsStore {
  @observable public transactions: TransactionStore[];

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.transactions = [];
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    this.transactions = [];

    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    const transactions = await getTransactions(deviceId, accessToken);
    transactions.map((t) => {
      this.addTransaction(t);
    });
  }

  @action
  public addTransaction(transactionData: ITransactionDTO): void {
    const transactionStore = new TransactionStore(transactionData, this._rootStore);

    runInAction(() => {
      this.transactions.push(transactionStore);
    });
  }
}
