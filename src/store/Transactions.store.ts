import { INewTransactionDTO, ITransactionDTO, TX_POLL_INTERVAL, createTransaction, getTransactions, sleep } from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from './Root.store';
import { TransactionStore } from './Transaction.store';
import { ENV_CONFIG } from '../env_config';
import { EmbeddedWalletAPI } from '../api/embeddedWallet.api';

type TTransactionHandler = (tx: ITransactionDTO) => void;

export class TransactionsStore {
  @observable public transactions: TransactionStore[];
  @observable public isLoading: boolean;
  @observable public error: string;

  private _transactionSubscriptions: Map<string, TTransactionHandler[]>;
  private _transactionsActivePolling: Map<string, boolean>;
  private _disposed: boolean;
  private _rootStore: RootStore;
  private _embeddedWalletAPI: EmbeddedWalletAPI;

  constructor(rootStore: RootStore) {
    this.transactions = [];
    this._transactionSubscriptions = new Map();
    this._transactionsActivePolling = new Map();
    this.isLoading = true;
    this.error = '';

    this._disposed = false;
    this._rootStore = rootStore;
    this._embeddedWalletAPI = new EmbeddedWalletAPI(rootStore);
    console.log('[Transactions] TransactionsStore initialized');

    makeObservable(this);
  }

  @action
  public setError(error: string): void {
    this.error = error;
  }

  @action
  public dispose(): void {
    console.log('[Transactions] Disposing TransactionsStore');
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
    console.log(`[Transactions] Adding transaction: ${transactionData.id}`, transactionData);
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

  @action
  public setTransactions(transactions: ITransactionDTO[]): void {
    console.log(`[Transactions] Setting ${transactions.length} transactions`);
    this.transactions = transactions.map((tx) => new TransactionStore(tx, this._rootStore));
  }

  @action
  public async getTransactions(): Promise<void> {
    console.log('[Transactions] Fetching all transactions');
    this.isLoading = true;

    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (deviceId && accessToken) {
        let transactions: ITransactionDTO[];
        
        if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
          console.log('[Transactions] Using embedded wallet API to fetch transactions');
          // Use current time minus 30 days as startDate (in milliseconds)
          const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
          transactions = await this._embeddedWalletAPI.getTransactions(deviceId, startDate);
        } else {
          console.log('[Transactions] Using standard API to fetch transactions');
          // Use current time minus 30 days as startDate (in milliseconds)
          const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const response = await getTransactions(deviceId, startDate, accessToken);
          transactions = await response.json();
        }
        
        console.log(`[Transactions] Retrieved ${transactions.length} transactions`);
        this.setTransactions(transactions);
      } else {
        console.warn('[Transactions] Cannot fetch transactions: missing deviceId or accessToken');
      }
    } catch (e: any) {
      console.error('[Transactions] Error fetching transactions:', e);
      this.setError(e.message);
    } finally {
      this.isLoading = false;
    }
  }

  public listenToTransactions(callback: TTransactionHandler): () => void {
    console.log('[Transactions] Starting transaction polling');
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    const subscriptionId = Math.random().toString();

    if (!this._transactionSubscriptions.has(deviceId)) {
      this._transactionSubscriptions.set(deviceId, []);
    }

    const deviceSubscriptions = this._transactionSubscriptions.get(deviceId)!;
    deviceSubscriptions.push(callback);
    this._transactionSubscriptions.set(deviceId, deviceSubscriptions);

    const poll = async () => {
      if (this._disposed || !this._transactionsActivePolling.get(deviceId)) {
        console.log(`[Transactions] Polling stopped for device: ${deviceId}`);
        return;
      }

      try {
        // Check if the SDK is ready before attempting to fetch transactions
        const sdkReady = ENV_CONFIG.USE_EMBEDDED_WALLET_SDK 
          ? !!this._rootStore.embeddedWalletSDKStore?.sdkInstance 
          : true;
        
        if (!sdkReady) {
          console.log('[Transactions] SDK not ready yet, waiting before polling again');
          await sleep(TX_POLL_INTERVAL);
          poll();
          return;
        }

        let transactions: ITransactionDTO[];
        
        if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
          // Use current time minus 30 days as startDate (in milliseconds)
          const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
          transactions = await this._embeddedWalletAPI.getTransactions(deviceId, startDate);
        } else {
          // Use current time minus 30 days as startDate (in milliseconds)
          const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const response = await getTransactions(deviceId, startDate, accessToken);
          transactions = await response.json();
        }

        if (transactions.length > 0) {
          console.log(`[Transactions] Poll retrieved ${transactions.length} transactions`);
        }
        
        const deviceCallbacks = this._transactionSubscriptions.get(deviceId) || [];
        transactions.forEach((transaction) => {
          deviceCallbacks.forEach((cb) => cb(transaction));
        });
      } catch (e) {
        console.error('[Transactions] Error during transaction polling:', e);
      }

      await sleep(TX_POLL_INTERVAL);
      poll();
    };

    if (!this._transactionsActivePolling.get(deviceId)) {
      console.log(`[Transactions] Starting transaction polling for device: ${deviceId}`);
      this._transactionsActivePolling.set(deviceId, true);
      poll();
    }

    return () => {
      console.log(`[Transactions] Unsubscribing from transactions, id: ${subscriptionId}`);
      const deviceCallbacks = this._transactionSubscriptions.get(deviceId) || [];
      const newCallbacks = deviceCallbacks.filter((cb) => cb !== callback);

      if (newCallbacks.length === 0) {
        console.log(`[Transactions] No more subscribers for device: ${deviceId}, stopping polling`);
        this._transactionsActivePolling.set(deviceId, false);
        this._transactionSubscriptions.delete(deviceId);
      } else {
        this._transactionSubscriptions.set(deviceId, newCallbacks);
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
        let transactions: ITransactionDTO[];

        if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
          transactions = await this._embeddedWalletAPI.getTransactions(
            this._rootStore.deviceStore.deviceId,
            startDate
          );
        } else {
          const response = await getTransactions(
            this._rootStore.deviceStore.deviceId,
            startDate,
            this._rootStore.userStore.accessToken,
          );

          if (!response.ok) {
            await sleep(TX_POLL_INTERVAL);
            continue;
          }

          transactions = await response.json();
        }

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
    console.log('[Transactions] Creating new transaction', dataToSend);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      let newTxData: ITransactionDTO;

      try {
        if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
          console.log('[Transactions] Using embedded wallet API to create transaction');
          newTxData = await this._embeddedWalletAPI.createTransaction(deviceId, dataToSend!);
        } else {
          console.log('[Transactions] Using standard API to create transaction');
          newTxData = await createTransaction(deviceId, accessToken, dataToSend);
        }
        
        console.log('[Transactions] Transaction created successfully:', newTxData.id);
        this.addTransaction(newTxData);
      } catch (error) {
        console.error('[Transactions] Error creating transaction:', error);
        throw error;
      }
    } else {
      console.error('[Transactions] Cannot create transaction: missing deviceId, accountId, or accessToken');
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
