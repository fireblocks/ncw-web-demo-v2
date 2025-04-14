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

export class AssetsStore {
  @observable public myAssets: AssetStore[];
  @observable public supportedAssets: AssetStore[];
  @observable public isLoading: boolean;
  @observable public isGettingBalances: boolean;
  @observable public error: string;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.myAssets = [];
    this.supportedAssets = [];
    this._rootStore = rootStore;
    this.isLoading = true;
    this.isGettingBalances = false;
    this.error = '';

    makeObservable(this);
  }

  @computed
  public get totalAvailableBalanceInUSD(): string {
    const balance = this.myAssets.reduce((acc, a) => acc + Number(a.totalBalance) * (a.assetData.rate || 0), 0);
    return localizedCurrencyView(balance);
  }

  @computed
  public get myAssetsSortedByBalanceInUSD(): AssetStore[] {
    return this.myAssets.slice().sort((a, b) => {
      if (a.assetData.rate && b.assetData.rate) {
        return b.totalBalance * b.assetData.rate - a.totalBalance * a.assetData.rate;
      }
      return 0;
    });
  }

  @computed
  public get myBaseAssets(): AssetStore[] {
    return this.myAssets.filter((a) => a.assetData.type === 'BASE_ASSET');
  }

  @computed
  public get myECDSAAssets(): AssetStore[] {
    return this.myAssets.filter((a) => a.assetData.algorithm === 'MPC_ECDSA_SECP256K1');
  }

  @computed
  public get myEDDSAAssets(): AssetStore[] {
    return this.myAssets.filter((a) => a.assetData.algorithm === 'MPC_EDDSA_ED25519');
  }

  @action
  public setSupportedAssets(assets: IAssetDTO[]): void {
    this.supportedAssets = [];
    assets.map((a) => {
      this.addSupportedAsset(a);
    });
  }

  @action
  public setMyAssets(assets: IAssetsSummaryDTO[]): void {
    this.myAssets = [];
    assets.map((a) => {
      this.addMyAsset(a);
    });
  }

  @action
  public async init(): Promise<void> {
    this.setIsLoading(true);
    await this.getMyAssets();
    await this.getSupported();
    this.setIsLoading(false);
  }

  @action
  public addMyAsset(assetData: IAssetsSummaryDTO): void {
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;

    if (accountId !== undefined) {
      const assetStore = new AssetStore(assetData.asset, assetData.balance, assetData.address, this._rootStore);

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
    const assetStore = new AssetStore(assetData, null, null, this._rootStore);
    this.supportedAssets.push(assetStore);
  }

  public async addAsset(assetId: string): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      await addAsset(deviceId, accountId, assetId, accessToken, this._rootStore);
      const assetDTO = await getAsset(deviceId, accountId, assetId, accessToken, this._rootStore);
      const balanceDTO = await getBalance(deviceId, accountId, assetId, accessToken, this._rootStore);
      const addressDTO = await getAddress(deviceId, accountId, assetId, accessToken, this._rootStore);

      this.addMyAsset({ asset: assetDTO, balance: balanceDTO, address: addressDTO });
    }
  }

  public refreshBalances(): void {
    this.setIsGettingBalances(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (accountId !== undefined) {
      getAssetsSummary(deviceId, accountId, accessToken, this._rootStore)
        .then((assetsSummary) => {
          assetsSummary.map((a) => {
            const asset = this.getAssetById(a.asset.id);
            if (asset) {
              asset.setBalance(a.balance);
            }
          });
        })
        .catch((e) => {
          this.setError(e.message);
        })
        .finally(() => {
          this.setIsGettingBalances(false);
        });
    }
  }

  public async getSupported(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      const assets = await getSupportedAssets(deviceId, accountId, accessToken, this._rootStore);
      this.setSupportedAssets(assets);
    }
  }

  public async getMyAssets(): Promise<void> {
    try {
      const deviceId = this._rootStore.deviceStore.deviceId;
      const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
      const accessToken = this._rootStore.userStore.accessToken;

      console.log('getMyAssets - Debug Info:', {
        deviceId,
        accountId,
        hasAccessToken: !!accessToken,
        accountStoreInitialized: !!this._rootStore.accountsStore,
      });


      if (deviceId && accountId !== undefined && accessToken) {
        const assetsSummary = await getAssetsSummary(deviceId, accountId, accessToken, this._rootStore);
        this.setMyAssets(assetsSummary);
      } else {
        console.warn('Cannot get assets - missing required data:', {
          deviceId: !!deviceId,
          accountId: accountId, // Show actual value to debug
          accessToken: !!accessToken,
        });

        // Instead of just failing silently, attempt to initialize what's missing
        if (!accountId && this._rootStore.accountsStore) {
          console.log('Attempting to initialize account...');
          // Try to initialize or retrieve account ID
          await this._rootStore.accountsStore.init();
        }

        this.setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in getMyAssets:', error);
      this.setIsLoading(false);
    }

  }

  public getAssetById(assetId: string): AssetStore | undefined {
    return this.myAssets.find((a) => a.id === assetId);
  }
}
