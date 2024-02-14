import { action, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from './Root.store';
import { TransactionStore } from './Transaction.store';
import { ITransactionData, getTransactions } from '@api';

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
    const transactions = await getTransactions('deviceId', this._rootStore.userStore.accessToken);
    transactions.map((t) => this.addTransaction(t));
  }

  @action
  public addTransaction(transactionData: ITransactionData): void {
    const transactionStore = new TransactionStore(transactionData, this._rootStore);

    runInAction(() => {
      this.transactions.push(transactionStore);
    });
  }
}
