import { INFTAssetDTO, INFTCollectionDTO, INFTTokenDTO, getNFTAssets, getNFTCollections, getNFTTokens } from '@api';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class NFTStore {
  @observable public collections: INFTCollectionDTO[];
  @observable public tokens: INFTTokenDTO[];
  @observable public assets: INFTAssetDTO[];

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.collections = [];
    this.tokens = [];
    this.assets = [];

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;

    if (deviceId && accountId !== undefined && accessToken) {
      const myCollections = await getNFTCollections(deviceId, accessToken);
      const myTokens = await getNFTTokens(deviceId, accountId, accessToken);
      const myAssets = await getNFTAssets(deviceId, accessToken);

      this.setCollections(myCollections);
      this.setTokens(myTokens);
      this.setAssets(myAssets);
    }
  }

  @action
  public setCollections(dto: INFTCollectionDTO[]): void {
    this.collections = dto;
  }

  @action
  public setTokens(dto: INFTTokenDTO[]): void {
    this.tokens = dto;
  }

  @action
  public setAssets(dto: INFTAssetDTO[]): void {
    this.assets = dto;
  }
}
