import { IAssetDTO, addAsset, getAsset, getAssets, getSupportedAssets } from '@api';
import { action, makeObservable, observable } from 'mobx';
import { AssetStore } from './Asset.store';
import { RootStore } from './Root.store';

export class AssetsStore {
  @observable public myAssets: AssetStore[];
  @observable public supportedAssets: AssetStore[];

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.myAssets = [];
    this.supportedAssets = [];
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId && accessToken) {
      const myAssets = await getAssets(deviceId, accountId, accessToken);
      const supportedAssets = await getSupportedAssets(deviceId, accountId, accessToken);

      myAssets.map((a) => {
        this.addMyAsset(a);
      });

      supportedAssets.map((a) => {
        this.addSupportedAsset(a);
      });
    }
  }

  @action
  public addMyAsset(assetData: IAssetDTO): void {
    const assetStore = new AssetStore(assetData, this._rootStore);

    this.myAssets.push(assetStore);
  }

  @action
  public addSupportedAsset(assetData: IAssetDTO): void {
    const assetStore = new AssetStore(assetData, this._rootStore);

    this.supportedAssets.push(assetStore);
  }

  public async addAsset(assetId: string): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accountId = this._rootStore.accountsStore.currentAccountId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accountId && accessToken) {
      await addAsset(deviceId, accountId, assetId, accessToken);
      const assetDTO = await getAsset(deviceId, accountId, assetId, accessToken);

      this.addMyAsset(assetDTO);
    }
  }
}
