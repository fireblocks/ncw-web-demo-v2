import { INewTransactionDTO, ITransactionDTO, createTransaction, getTransactions, sleep } from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from './Root.store';
import { TransactionStore } from './Transaction.store';

type TTransactionHandler = (tx: ITransactionDTO) => void;

export class TransactionsStore {
  @observable public transactions: TransactionStore[];
  @observable public transactionSubscriptions: Map<string, TTransactionHandler[]>;
  @observable public transactionsActivePolling: Map<string, boolean>;
  @observable public isLoading: boolean;

  private _disposed: boolean;
  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.transactions = [];
    this.transactionSubscriptions = new Map();
    this.transactionsActivePolling = new Map();
    this.isLoading = true;

    this._disposed = false;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public dispose(): void {
    this.transactions = [];
    this.transactionSubscriptions.clear();
    this.transactionsActivePolling.clear();
    this._disposed = true;
  }

  @action
  public setIsLoading(state: boolean): void {
    this.isLoading = state;
  }

  @action
  public async init(): Promise<void> {
    this.setIsLoading(true);
    this.transactions = [];

    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    const response = await getTransactions(deviceId, accessToken);
    const transactions = await response.json();

    transactions.forEach((t: ITransactionDTO) => {
      this.addTransaction(t);
    });
    this.setIsLoading(false);
  }

  @action
  public addTransaction(transactionData: ITransactionDTO): void {
    const transactionStore = new TransactionStore(transactionData, this._rootStore);

    runInAction(() => {
      this.transactions.push(transactionStore);
    });
  }

  public getTransactionById(id: string): TransactionStore | null {
    return this.transactions.find((t) => t.id === id) || null;
  }

  public addOrEditTransaction(transactionData: ITransactionDTO): void {
    const existingTransaction = this.getTransactionById(transactionData.id);

    if (existingTransaction) {
      existingTransaction.update(transactionData);
    } else {
      this.addTransaction(transactionData);
    }
  }

  public listenToTransactions(callBack: TTransactionHandler): () => void {
    let subscriptions = this.transactionSubscriptions.get(this._rootStore.deviceStore.deviceId);

    if (!subscriptions) {
      subscriptions = [];
      runInAction(() => {
        if (subscriptions) {
          this.transactionSubscriptions.set(this._rootStore.deviceStore.deviceId, subscriptions);
        }
      });
    }

    runInAction(() => {
      if (subscriptions) {
        subscriptions.push(callBack);
      }
    });

    this.startPollingTransactions()
      .then(() => {})
      .catch(() => {});

    return () => {
      this.stopPollingTransactions();

      if (subscriptions) {
        const callBackIndex = subscriptions.indexOf(callBack);
        if (callBackIndex !== -1) {
          subscriptions.splice(callBackIndex, 1);
          if (subscriptions.length === 0) {
            this.transactionSubscriptions.delete(this._rootStore.deviceStore.deviceId);
          }
        }
      }
    };
  }

  public stopPollingTransactions(): void {
    this.transactionsActivePolling.delete(this._rootStore.deviceStore.deviceId);
  }

  @action
  public async startPollingTransactions(): Promise<void> {
    if (!this.hasTransactionsActivePollingForCurrentDevice) {
      return;
    }

    this.transactionsActivePolling.set(this._rootStore.deviceStore.deviceId, true);

    while (!this._disposed) {
      try {
        let startDate = 0;

        const response = await getTransactions(
          this._rootStore.deviceStore.deviceId,
          this._rootStore.userStore.accessToken,
        );

        if (!response.ok) {
          await sleep();
          continue;
        }

        const transactions = await response.json();

        transactions.forEach((t: ITransactionDTO) => {
          if (t.id && t.lastUpdated) {
            startDate = Math.max(startDate, t.lastUpdated);
            const subscribers = this.transactionSubscriptions.get(this._rootStore.deviceStore.deviceId);
            if (subscribers) {
              subscribers.forEach((s) => {
                if (!this._disposed || this.transactionsActivePolling.get(this._rootStore.deviceStore.deviceId)) {
                  s(t);
                }
              });
            }
          }
        });
      } catch (e) {
        console.error('Error polling transactions', e);
        await sleep();
      }
    }
  }

  @computed
  public get hasTransactionsActivePollingForCurrentDevice(): boolean {
    return !!this.transactionsActivePolling.get(this._rootStore.deviceStore.deviceId);
  }

  public async createTransaction(dataToSend?: INewTransactionDTO): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      const newTxData = await createTransaction(deviceId, accessToken, dataToSend);
      this.addTransaction(newTxData);
    }
  }
}
