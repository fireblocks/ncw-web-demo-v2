import { IAssetDTO, addAsset, getAddress, getAsset, getAssets, getBalance, getSupportedAssets } from '@api';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { AssetStore } from './Asset.store';
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
    this.isLoading = false;
    this.error = '';

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    this.setIsLoading(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId !== undefined && accessToken) {
      const myAssets = await getAssets(deviceId, accountId, accessToken);
      const supportedAssets = await getSupportedAssets(deviceId, accountId, accessToken);

      await Promise.all(
        myAssets.map(async (a) => {
          await this.addMyAsset(a);
        }),
      );

      supportedAssets.map((a) => {
        this.addSupportedAsset(a);
      });
    }
    this.setIsLoading(false);
  }

  @action
  public async addMyAsset(assetData: IAssetDTO): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (accountId !== undefined) {
      const balance = await getBalance(deviceId, accountId, assetData.id, accessToken);
      const address = await getAddress(deviceId, accountId, assetData.id, accessToken);

      const assetStore = new AssetStore(assetData, balance, address, this._rootStore);

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

      await this.addMyAsset(assetDTO);
    }
  }

  public refreshBalances(): void {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (accountId !== undefined) {
      this.myAssets.forEach((a) => {
        getBalance(deviceId, accountId, a.id, accessToken)
          .then((balance) => {
            a.setBalance(balance);
          })
          .catch((e) => {
            this.setError(e.message);
          });
      });
    }
  }
}
