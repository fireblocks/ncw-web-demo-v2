import {
  IAssetDTO,
  IAssetsSummaryDTO,
  addAsset,
  getAddress,
  getAsset,
  getAssetsSummary,
  getBalance,
  getSupportedAssets,
} from '@api';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { AssetStore, localizedCurrencyView } from './Asset.store';
import { RootStore } from './Root.store';

/**
 * Debounce utility function
 * Creates a debounced version of a function that delays its execution until after
 * the specified wait time has elapsed since the last time it was invoked
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the original function
 */
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * AssetsStore manages the collection of cryptocurrency assets in the system.
 * It handles fetching, storing, and updating asset data, balances, and addresses.
 * It also provides methods for adding new assets and refreshing balances.
 */
export class AssetsStore {
  /** Collection of assets owned by the user */
  @observable public myAssets: AssetStore[];

  /** Collection of all assets supported by the system */
  @observable public supportedAssets: AssetStore[];

  /** Flag indicating whether assets are currently being loaded */
  @observable public isLoading: boolean;

  /** Flag indicating whether asset balances are currently being refreshed */
  @observable public isGettingBalances: boolean;

  /** Error message from the most recent operation */
  @observable public error: string;

  /** Timestamp of the last balance refresh operation */
  private _lastRefreshTime: number = 0;

  /** Debounced function for refreshing balances */
  private _refreshDebounced: () => void;

  /** Reference to the root store for accessing other stores */
  private _rootStore: RootStore;

  /**
   * Initializes the AssetsStore with default values and a reference to the root store
   * Also sets up the debounced refresh function for balance updates
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.myAssets = [];
    this.supportedAssets = [];
    this._rootStore = rootStore;
    this.isLoading = true;
    this.isGettingBalances = false;
    this.error = '';

    // Initialize debounced refresh function with 5 second delay
    this._refreshDebounced = debounce(() => {
      this._doRefreshBalances();
    }, 5000);

    makeObservable(this);
  }

  /**
   * Calculates the total value of all assets in USD
   * @returns The total balance formatted as a currency string
   */
  @computed
  public get totalAvailableBalanceInUSD(): string {
    const balance = this.myAssets.reduce((acc, a) => {
      const rate = a.assetData?.rate || 0;
      const total = Number(a.totalBalance || 0);
      return acc + (total * rate);
    }, 0);
    return localizedCurrencyView(balance);
  }

  /**
   * Gets the user's assets sorted by their USD value (highest to lowest)
   * @returns Sorted array of asset stores
   */
  @computed
  public get myAssetsSortedByBalanceInUSD(): AssetStore[] {
    return this.myAssets.slice().sort((a, b) => {
      const aRate = a.assetData?.rate || 0;
      const bRate = b.assetData?.rate || 0;
      const aBalance = a.totalBalance || 0;
      const bBalance = b.totalBalance || 0;
      return (bBalance * bRate) - (aBalance * aRate);
    });
  }

  /**
   * Gets all base assets owned by the user
   * @returns Array of base asset stores
   */
  @computed
  public get myBaseAssets(): AssetStore[] {
    return this.myAssets.filter((a) => a.assetData?.type === 'BASE_ASSET');
  }

  /**
   * Gets all ECDSA assets owned by the user (using SECP256K1 curve)
   * @returns Array of ECDSA asset stores
   */
  @computed
  public get myECDSAAssets(): AssetStore[] {
    return this.myAssets.filter((a) => a.assetData?.algorithm === 'MPC_ECDSA_SECP256K1');
  }

  /**
   * Gets all EDDSA assets owned by the user (using ED25519 curve)
   * @returns Array of EDDSA asset stores
   */
  @computed
  public get myEDDSAAssets(): AssetStore[] {
    return this.myAssets.filter((a) => a.assetData?.algorithm === 'MPC_EDDSA_ED25519');
  }

  @action
  public setSupportedAssets(assets: IAssetDTO[]): void {
    this.supportedAssets = [];
    assets.forEach((a) => {
      if (a) this.addSupportedAsset(a);
    });
  }

  @action
  public setMyAssets(assets: IAssetsSummaryDTO[]): void {
    this.myAssets = [];
    assets.forEach((a) => {
      if (a?.asset) this.addMyAsset(a);
    });
  }

  /**
   * Initializes the assets store by fetching the user's assets and supported assets
   * This should be called when the store is first used
   */
  @action
  public async init(): Promise<void> {
    this.setIsLoading(true);
    try {
      await this.getMyAssets();
      await this.getSupported();
    } catch (error) {
      console.error('Error initializing assets:', error);
      this.setError(error.message);
    } finally {
      this.setIsLoading(false);
    }
  }

  @action
  public addMyAsset(assetData: IAssetsSummaryDTO): void {
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;

    if (accountId !== undefined && assetData?.asset) {
      const assetStore = new AssetStore(
        assetData.asset,
        assetData.balance || null,
        assetData.address || null,
        this._rootStore
      );

      runInAction(() => {
        this.myAssets.push(assetStore);
      });
    }
  }

  @action
  public setIsLoading(state: boolean): void {
    this.isLoading = state;
  }

  @action
  public setIsGettingBalances(state: boolean): void {
    this.isGettingBalances = state;
  }

  @action
  public setError(error: string): void {
    this.error = error;
  }

  @action
  public addSupportedAsset(assetData: IAssetDTO): void {
    if (!assetData) return;
    const assetStore = new AssetStore(assetData, null, null, this._rootStore);
    this.supportedAssets.push(assetStore);
  }

  /**
   * Adds a new asset to the user's assets collection
   * @param assetId The ID of the asset to add
   * @throws Error if the asset cannot be added
   */
  public async addAsset(assetId: string): Promise<void> {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (!deviceId || accountId === undefined || !accessToken) {
        throw new Error('Missing required data for adding asset');
      }

      // Add the asset first
      const addedAsset = await addAsset(deviceId, accountId, assetId, accessToken, this._rootStore);
      if (!addedAsset) {
        throw new Error('Failed to add asset');
      }

      // Get asset details
      const [assetDTO, balanceDTO, addressDTO] = await Promise.all([
        getAsset(deviceId, accountId, assetId, accessToken, this._rootStore),
        getBalance(deviceId, accountId, assetId, accessToken, this._rootStore),
        getAddress(deviceId, accountId, assetId, accessToken, this._rootStore)
      ]);

      if (!assetDTO) {
        throw new Error('Failed to get asset details');
      }

      // Add to my assets
      this.addMyAsset({
        asset: assetDTO,
        balance: balanceDTO || null,
        address: addressDTO || null
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      this.setError(error.message);
      throw error;
    }
  }

  private _doRefreshBalances(): void {
    console.log('[AssetsStore] Starting balance refresh', {
      timeSinceLastRefresh: Date.now() - this._lastRefreshTime,
      isGettingBalances: this.isGettingBalances
    });

    this.setIsGettingBalances(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (accountId !== undefined) {
      getAssetsSummary(deviceId, accountId, accessToken, this._rootStore)
        .then((assetsSummary) => {
          console.log('[AssetsStore] Balance refresh completed successfully');
          assetsSummary.map((a) => {
            const asset = this.getAssetById(a.asset.id);
            if (asset) {
              asset.setBalance(a.balance);
            }
          });
        })
        .catch((e) => {
          console.error('[AssetsStore] Balance refresh failed:', e);
          this.setError(e.message);
        })
        .finally(() => {
          this.setIsGettingBalances(false);
          this._lastRefreshTime = Date.now();
        });
    }
  }

  /**
   * Refreshes the balances of all assets
   * Uses debouncing to prevent too frequent API calls
   */
  public refreshBalances(): void {
    console.log('[AssetsStore] refreshBalances called', {
      timeSinceLastRefresh: Date.now() - this._lastRefreshTime,
      isGettingBalances: this.isGettingBalances
    });

    // Only allow refresh if at least 5 seconds have passed since last refresh
    const now = Date.now();
    if (now - this._lastRefreshTime >= 5000) {
      this._doRefreshBalances();
    } else {
      // If less than 5 seconds have passed, schedule a debounced refresh
      console.log('[AssetsStore] Scheduling debounced refresh');
      this._refreshDebounced();
    }
  }

  /**
   * Fetches all assets supported by the system
   * Updates the supportedAssets collection with the results
   */
  public async getSupported(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      const assets = await getSupportedAssets(deviceId, accountId, accessToken, this._rootStore);
      this.setSupportedAssets(assets);
    }
  }

  /**
   * Fetches all assets owned by the user
   * Updates the myAssets collection with the results
   * Attempts to initialize accounts if needed
   */
  public async getMyAssets(): Promise<void> {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      let accountId = this._rootStore.accountsStore.currentAccount?.accountId;
      const accessToken = this._rootStore.userStore.accessToken;

      console.log('getMyAssets - Debug Info:', {
        deviceId,
        accountId,
        hasAccessToken: !!accessToken,
        accountStoreInitialized: !!this._rootStore.accountsStore,
      });

      // If accountId is missing but we have deviceId and accessToken, try to initialize accounts
      if (!accountId && deviceId && accessToken && this._rootStore.accountsStore) {
        console.log('Attempting to initialize account before fetching assets...');
        await this._rootStore.accountsStore.init();
        // Get the accountId again after initialization
        accountId = this._rootStore.accountsStore.currentAccount?.accountId;
        console.log('After account initialization, accountId:', accountId);
      }

      if (deviceId && accountId !== undefined && accessToken) {
        console.log('Fetching assets with deviceId, accountId, and accessToken');
        const assetsSummary = await getAssetsSummary(deviceId, accountId, accessToken, this._rootStore);
        this.setMyAssets(assetsSummary);
      } else {
        console.warn('Cannot get assets - missing required data:', {
          deviceId: !!deviceId,
          accountId: accountId, // Show actual value to debug
          accessToken: !!accessToken,
        });

        this.setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in getMyAssets:', error);
      this.setIsLoading(false);
    }
  }

  /**
   * Finds an asset in the user's assets collection by its ID
   * @param assetId The ID of the asset to find
   * @returns The asset store if found, undefined otherwise
   */
  public getAssetById(assetId: string): AssetStore | undefined {
    return this.myAssets.find((a) => a.id === assetId);
  }
}
