import { INewTransactionDTO, ITransactionDTO, TX_POLL_INTERVAL, createTransaction, getTransactions, sleep } from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from './Root.store';
import { TransactionStore } from './Transaction.store';

type TTransactionHandler = (tx: ITransactionDTO) => void;

export class TransactionsStore {
  @observable public transactions: TransactionStore[];
  @observable public isLoading: boolean;
  @observable public error: string;

  private _transactionSubscriptions: Map<string, TTransactionHandler[]>;
  private _transactionsActivePolling: Map<string, boolean>;
  private _disposed: boolean;
  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.transactions = [];
    this._transactionSubscriptions = new Map();
    this._transactionsActivePolling = new Map();
    this.isLoading = true;
    this.error = '';

    this._disposed = false;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public setError(error: string): void {
    this.error = error;
  }

  @action
  public dispose(): void {
    this.transactions = [];
    this._transactionSubscriptions.clear();
    this._transactionsActivePolling.clear();
    this._disposed = true;
  }

  @action
  public setIsLoading(state: boolean): void {
    this.isLoading = state;
  }

  @action
  public addTransaction(transactionData: ITransactionDTO): void {
    const transactionStore = new TransactionStore(transactionData, this._rootStore);

    runInAction(() => {
      this.transactions.unshift(transactionStore);
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
    let subscriptions = this._transactionSubscriptions.get(this._rootStore.deviceStore.deviceId);

    if (!subscriptions) {
      subscriptions = [];
      this._transactionSubscriptions.set(this._rootStore.deviceStore.deviceId, subscriptions);
    }

    subscriptions.push(callBack);

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
            this._transactionSubscriptions.delete(this._rootStore.deviceStore.deviceId);
          }
        }
      }
    };
  }

  public stopPollingTransactions(): void {
    this._transactionsActivePolling.delete(this._rootStore.deviceStore.deviceId);
  }

  @action
  public async startPollingTransactions(): Promise<void> {
    if (this._hasTransactionsActivePollingForCurrentDevice) {
      return;
    }

    this._transactionsActivePolling.set(this._rootStore.deviceStore.deviceId, true);

    let startDate = 0;

    while (!this._disposed) {
      try {
        await this._rootStore.userStore.resetAccessToken();
        const response = await getTransactions(
          this._rootStore.deviceStore.deviceId,
          startDate,
          this._rootStore.userStore.accessToken,
        );

        if (!response.ok) {
          await sleep(TX_POLL_INTERVAL);
          continue;
        }

        const transactions = await response.json();

        transactions.forEach((tx: ITransactionDTO) => {
          if (tx.id && tx.lastUpdated) {
            startDate = Math.max(startDate, tx.lastUpdated);
            const subscribers = this._transactionSubscriptions.get(this._rootStore.deviceStore.deviceId);

            if (subscribers) {
              for (const subscriber of subscribers) {
                if (this._disposed || !this._transactionsActivePolling.get(this._rootStore.deviceStore.deviceId)) {
                  break;
                }
                subscriber(tx);
              }
            }
          }
        });
      } catch (e: any) {
        this.setError(e.message);
        await sleep(TX_POLL_INTERVAL);
      }
    }
  }

  @computed
  public get transactionsSortedByCreationDate(): TransactionStore[] {
    return this.transactions.slice().sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt;
      }
      return 0;
    });
  }

  @computed
  private get _hasTransactionsActivePollingForCurrentDevice(): boolean {
    return !!this._transactionsActivePolling.get(this._rootStore.deviceStore.deviceId);
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

  @computed
  public get completedAmount(): number {
    return this.transactions.filter((tx) => tx.status === 'COMPLETED').length;
  }

  @computed
  public get failedOrCanceledAmount(): number {
    return this.transactions.filter((tx) => tx.status === 'FAILED' || tx.status === 'CANCELLED').length;
  }

  @computed
  public get hasPendingSignature(): boolean {
    return !!this.transactions.filter((tx) => tx.status === 'PENDING_SIGNATURE').length;
  }

  @computed
  public get inProgressAmount(): number {
    return this.transactions.length - this.completedAmount - this.failedOrCanceledAmount;
  }
}
