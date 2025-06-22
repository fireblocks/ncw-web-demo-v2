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
import { top100Cryptos } from '@services';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { AssetStore, localizedCurrencyView, NOT_AVAILABLE_PLACEHOLDER } from './Asset.store';
import { RootStore } from './Root.store';

/**
 * Debounce utility function
 * Creates a debounced version of a function that delays its execution until after
 * the specified wait time has elapsed since the last time it was invoked
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the original function
 */
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
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
   * Gets price from top100Cryptos based on asset symbol or name
   * @param asset The asset to get the price for
   * @returns The price from top100Cryptos or 0 if not found
   */
  private getAssetPriceFromTop100Cryptos(asset: AssetStore): number {
    // Get the price from top100Cryptos using the asset symbol
    const symbol = asset.symbol.toUpperCase();
    let cryptoData = top100Cryptos[symbol];

    // If not found, try to find it by name
    if (!cryptoData) {
      // Try to find a match by comparing the asset name with the titles in top100Cryptos
      const assetNameLower = asset.name.toLowerCase();

      // Find a matching cryptocurrency by comparing the asset name with the titles in top100Cryptos
      const matchingSymbol = Object.keys(top100Cryptos).find((key) => {
        const cryptoTitle = top100Cryptos[key].title.toLowerCase();
        return assetNameLower.includes(cryptoTitle) || cryptoTitle.includes(assetNameLower);
      });

      if (matchingSymbol) {
        cryptoData = top100Cryptos[matchingSymbol];
      }
    }

    // Return the price if found, otherwise 0
    return cryptoData ? cryptoData.price : 0;
  }

  /**
   * Calculates the total value of all assets in USD
   * @returns The total balance formatted as a currency string or placeholder if still loading
   */
  @computed
  public get totalAvailableBalanceInUSD(): string {
    // Check if data is still loading
    if (this.isLoading) {
      return NOT_AVAILABLE_PLACEHOLDER;
    }

    // Ensure myAssets is initialized and not empty
    if (!this.myAssets || this.myAssets.length === 0) {
      return localizedCurrencyView(0);
    }

    const balance = this.myAssets.reduce((acc, a) => {
      // Use top100Cryptos to get the price instead of a.assetData.rate
      const rate = this.getAssetPriceFromTop100Cryptos(a);
      const total = Number(a.totalBalance > 0 ? a.totalBalance * rate : 0);
      return acc + total;
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
      return bBalance * bRate - aBalance * aRate;
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
    // Create a map of existing assets by ID for quick lookup
    const existingAssetsMap = new Map<string, AssetStore>();
    this.myAssets.forEach((asset) => {
      existingAssetsMap.set(asset.id, asset);
    });

    // Create a new array to hold updated assets
    const updatedAssets: AssetStore[] = [];

    // Process each asset from the API
    assets.forEach((a) => {
      if (a?.asset) {
        const assetId = a.asset.id;
        const existingAsset = existingAssetsMap.get(assetId);

        if (existingAsset) {
          // Update existing asset
          if (a.balance) existingAsset.setBalance(a.balance);
          if (a.address) existingAsset.setAddress(a.address);
          updatedAssets.push(existingAsset);
          // Remove from map to track which assets were processed
          existingAssetsMap.delete(assetId);
        } else {
          // Add new asset
          const newAsset = new AssetStore(a.asset, a.balance || null, a.address || null, this._rootStore);
          updatedAssets.push(newAsset);
        }
      }
    });

    // Replace the assets array with the updated one
    this.myAssets = updatedAssets;
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
    } catch (error: any) {
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
        this._rootStore,
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
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const addedAsset = await addAsset(deviceId, accountId, assetId, accessToken, this._rootStore);
      if (!addedAsset) {
        throw new Error('Failed to add asset');
      }

      // Get asset details
      const [assetDTO, balanceDTO, addressDTO] = await Promise.all([
        // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
        getAsset(deviceId, accountId, assetId, accessToken, this._rootStore),
        // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
        getBalance(deviceId, accountId, assetId, accessToken, this._rootStore),
        // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
        getAddress(deviceId, accountId, assetId, accessToken, this._rootStore),
      ]);

      if (!assetDTO) {
        throw new Error('Failed to get asset details');
      }

      // Add to my assets
      this.addMyAsset({
        asset: assetDTO,
        balance: balanceDTO || null,
        address: addressDTO || null,
      });
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  private _doRefreshBalances(): void {
    this.setIsGettingBalances(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (accountId !== undefined) {
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      getAssetsSummary(deviceId, accountId, accessToken, this._rootStore)
        .then((assetsSummary) => {
          // Use setMyAssets to properly handle updates and new assets
          this.setMyAssets(assetsSummary);
        })
        .catch((e) => {
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
    // Only allow refresh if at least 5 seconds have passed since last refresh
    const now = Date.now();
    if (now - this._lastRefreshTime >= 5000) {
      this._doRefreshBalances();
    } else {
      // If less than 5 seconds have passed, schedule a debounced refresh
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
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
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

      // If accountId is missing but we have deviceId and accessToken, try to initialize accounts
      if (!accountId && deviceId && accessToken && this._rootStore.accountsStore) {
        await this._rootStore.accountsStore.init();
        // Get the accountId again after initialization
        accountId = this._rootStore.accountsStore.currentAccount?.accountId;
      }

      if (deviceId && accountId !== undefined && accessToken) {
        // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
        const assetsSummary = await getAssetsSummary(deviceId, accountId, accessToken, this._rootStore);
        this.setMyAssets(assetsSummary);
      } else {
        this.setIsLoading(false);
      }
    } catch (error) {
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

  /**
   * Refreshes the balance of a specific asset by its ID
   * @param assetId The ID of the asset to refresh
   * @returns A promise that resolves when the balance is refreshed
   */
  public async refreshAssetBalance(assetId: string): Promise<void> {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
      const accessToken = this._rootStore.userStore.accessToken;

      if (!deviceId || accountId === undefined || !accessToken) {
        console.warn('[Assets] Missing required data for refreshing asset balance');
        return;
      }

      const asset = this.getAssetById(assetId);
      if (!asset) {
        console.warn(`[Assets] Asset with ID ${assetId} not found, fetching asset data`);

        try {
          // Try to get the specific asset data
          // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
          const assetData = await getAsset(deviceId, accountId, assetId, accessToken, this._rootStore);

          if (assetData) {
            // Create a new asset and add it to myAssets
            const newAsset = new AssetStore(assetData, null, null, this._rootStore);
            runInAction(() => {
              this.myAssets.push(newAsset);
            });

            // Now get the balance for this new asset
            // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
            const balanceDTO = await getBalance(deviceId, accountId, assetId, accessToken, this._rootStore);

            if (balanceDTO) {
              newAsset.setBalance(balanceDTO);
              console.log(`[Assets] Successfully added and refreshed balance for new asset ${assetId}`);
            }
            return;
          }
        } catch (assetError) {
          console.error(`[Assets] Error fetching asset data for ${assetId}:`, assetError);
          // If we can't get the specific asset, refresh all assets as a fallback
          console.log(`[Assets] Falling back to refreshing all assets`);
          this.refreshBalances();
          return;
        }

        // If we couldn't get the specific asset, refresh all assets
        console.log(`[Assets] Asset ${assetId} not found, refreshing all assets instead`);
        this.refreshBalances();
        return;
      }

      console.log(`[Assets] Refreshing balance for asset ${assetId}`);

      // Get the balance for the specific asset
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const balanceDTO = await getBalance(deviceId, accountId, assetId, accessToken, this._rootStore);

      if (balanceDTO) {
        // Update the asset's balance
        asset.setBalance(balanceDTO);
        console.log(`[Assets] Successfully refreshed balance for asset ${assetId}`);
      }
    } catch (error: any) {
      console.error(`[Assets] Error refreshing balance for asset ${assetId}:`, error);
      this.setError(error.message);
    }
  }
}
