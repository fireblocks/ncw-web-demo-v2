import {
  INewTransactionDTO,
  ITransactionDTO,
  TX_POLL_INTERVAL,
  createTransaction,
  getTransactions,
  sleep,
  TTransactionStatus, ITransactionDetailsDTO,
} from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { ENV_CONFIG } from '../env_config.ts';
import { RootStore } from './Root.store';
import { TransactionStore } from './Transaction.store';

type TTransactionHandler = (tx: ITransactionDTO) => void;

export class TransactionsStore {
  @observable public transactions: TransactionStore[];
  @observable public isLoading: boolean;
  @observable public error: string;

  private _transactionSubscriptions: Map<string, TTransactionHandler[]>;
  public _transactionsActivePolling: Map<string, boolean>;
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

  public updateOneTransaction(transactionData: ITransactionDTO): void {
    const existingTransaction = this.getTransactionById(transactionData.id);
    if (existingTransaction) {
      existingTransaction.updateOneFromWebPush(transactionData);
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
    console.log('[Transactions] Stopping transaction updates subscription');
    this._transactionsActivePolling.delete(this._rootStore.deviceStore.deviceId);
    // The actual unsubscription from Firebase messaging is handled in UserStore.logout()
    // which calls FirebaseAuthManager.abortMessaging()
  }

  @action
  public async startPollingTransactions(): Promise<void> {
    if (this._hasTransactionsActivePollingForCurrentDevice) {
      return;
    }

    this._transactionsActivePolling.set(this._rootStore.deviceStore.deviceId, true);

    // Fetch initial transactions to populate the store
    await this.fetchTransactions();

    if (ENV_CONFIG.USE_WEB_PUSH) {
      // If web push is enabled, rely on push notifications
      // The push notification system is already set up in UserStore.initializeAndSetupPushNotifications()
      console.log('[Transactions] Started listening for transaction updates via push notifications');
    } else {
      // If web push is disabled, use polling
      console.log('[Transactions] Started polling for transaction updates');
      this.startPollingLoop();
    }
  }

  private async startPollingLoop(): Promise<void> {
    while (this._hasTransactionsActivePollingForCurrentDevice && !this._disposed) {
      try {
        await sleep(TX_POLL_INTERVAL);

        if (!this._hasTransactionsActivePollingForCurrentDevice || this._disposed) {
          break;
        }

        await this.fetchTransactions();
      } catch (error) {
        console.error('[Transactions] Error during transaction polling:', error);
        // Continue polling despite errors
      }
    }
  }

  /**
   * Fetches transactions from the server once
   * This is used for the initial load and can be called to refresh transactions manually
   */
  @action
  public async fetchTransactions(): Promise<void> {
    try {
      await this._rootStore.userStore.resetAccessToken();
      const response = await getTransactions(
        this._rootStore.deviceStore.deviceId,
        0, // Get all transactions
        this._rootStore.userStore.accessToken,
        // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
        this._rootStore,
      );

      if (!ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && !response?.ok) {
        return;
      }

      const transactions = ENV_CONFIG.USE_EMBEDDED_WALLET_SDK ? response : await response.json();

      transactions.forEach((tx: ITransactionDTO) => {
        if (tx.id) {
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
    }
  }

  /**
   * Fetches a single transaction by ID from the server
   * @param transactionId The ID of the transaction to fetch
   * @returns A promise that resolves when the transaction is fetched
   */
  @action
  public async fetchTransactionById(transactionId: string): Promise<void> {
    console.log(`[Transactions] Fetching transaction by ID: ${transactionId}`);
    try {
      await this._rootStore.userStore.resetAccessToken();

      if (!ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
        // For non-embedded wallet, use the existing getTransactions API
        const response = await getTransactions(
          this._rootStore.deviceStore.deviceId,
          0, // Get all transactions
          this._rootStore.userStore.accessToken,
        );

        if (!response?.ok) {
          return;
        }

        const transactions = await response.json();
        const transaction = transactions.find((tx: ITransactionDTO) => tx.id === transactionId);

        if (transaction) {
          console.log(`[Transactions] Found transaction ${transactionId}:`, transaction);
          this.handleTransactionUpdate(transaction);
        } else {
          console.warn(`[Transactions] Transaction with ID ${transactionId} not found`);
        }
      } else {
        // For embedded wallet, use the getTransaction method directly
        if (!this._rootStore.fireblocksSDKStore.fireblocksEW) {
          console.error('[Transactions] Embedded wallet SDK is not initialized');
          return;
        }

        try {
          // Use getTransaction method to fetch a single transaction by ID
          const transaction = await this._rootStore.fireblocksSDKStore.fireblocksEW.getTransaction(transactionId);

          if (transaction) {
            console.log(`[Transactions] Successfully fetched transaction ${transactionId}:`, transaction);

            // Convert the transaction to the expected format
            const formattedTransaction: ITransactionDTO = {
              id: transaction.id!,
              status: transaction.status as TTransactionStatus,
              createdAt: transaction.createdAt,
              lastUpdated: transaction.lastUpdated,
              details: transaction as unknown as ITransactionDetailsDTO,
            };

            // Update the transaction in the store
            this.handleTransactionUpdate(formattedTransaction);
          } else {
            console.warn(`[Transactions] Transaction with ID ${transactionId} not found`);
          }
        } catch (error) {
          console.error(`[Transactions] Error fetching transaction by ID ${transactionId}:`, error);
          throw error;
        }
      }
    } catch (e: any) {
      console.error(`[Transactions] Error fetching transaction by ID ${transactionId}:`, e);
      this.setError(e.message);
    }
  }

  /**
   * Handles a transaction update received from a push notification
   * @param transaction The transaction data from the push notification
   */
  @action
  public handleTransactionUpdate(transaction: ITransactionDTO): void {
    if (!transaction.id) {
      console.error('[Transactions] Received transaction update without ID:', transaction);
      return;
    }

    console.log(`[Transactions] Received update for transaction ${transaction.id}:`, transaction);

    // Only notify subscribers about the specific transaction received
    this.updateOneTransaction(transaction);
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
  public get _hasTransactionsActivePollingForCurrentDevice(): boolean {
    return !!this._transactionsActivePolling.get(this._rootStore.deviceStore.deviceId);
  }

  public async createTransaction(dataToSend: INewTransactionDTO): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const newTxData = await createTransaction(deviceId, accessToken, dataToSend, this._rootStore);
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
