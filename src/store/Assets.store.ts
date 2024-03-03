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
  @observable public error: string;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.myAssets = [];
    this.supportedAssets = [];
    this._rootStore = rootStore;
    this.isLoading = true;
    this.error = '';

    makeObservable(this);
  }

  @computed
  public get totalAvailableBalanceInUSD(): string {
    const balance = this.myAssets.reduce((acc, a) => acc + Number(a.totalBalance) * (a.assetData.rate || 0), 0);
    return localizedCurrencyView(balance);
  }

  @action
  public async init(): Promise<void> {
    this.setIsLoading(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      const assetsSummary = await getAssetsSummary(deviceId, accountId, accessToken);
      const supportedAssets = await getSupportedAssets(deviceId, accountId, accessToken);

      assetsSummary.map(async (a) => {
        await this.addMyAsset(a);
      }),
        supportedAssets.map((a) => {
          this.addSupportedAsset(a);
        });
    }
    this.setIsLoading(false);
  }

  @action
  public async addMyAsset(assetData: IAssetsSummaryDTO): Promise<void> {
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
      await addAsset(deviceId, accountId, assetId, accessToken);
      const assetDTO = await getAsset(deviceId, accountId, assetId, accessToken);
      const balanceDTO = await getBalance(deviceId, accountId, assetId, accessToken);
      const addressDTO = await getAddress(deviceId, accountId, assetId, accessToken);

      await this.addMyAsset({ asset: assetDTO, balance: balanceDTO, address: addressDTO });
    }
  }

  public refreshBalances(): void {
    this.setIsLoading(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (accountId !== undefined) {
      getAssetsSummary(deviceId, accountId, accessToken)
        .then((assetsSummary) => {
          assetsSummary.map((a) => {
            const asset = this.myAssets.find((as) => as.id === a.asset.id);
            if (asset) {
              asset.setBalance(a.balance);
            }
          });
        })
        .catch((e) => {
          this.setError(e.message);
        })
        .finally(() => {
          this.setIsLoading(false);
        });
    }
  }
}
