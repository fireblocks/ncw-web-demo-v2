import { getNFTCollections, getNFTTokens } from '@api';
import { CollectionOwnership, TokenWithBalance } from 'fireblocks-sdk';
import { action, makeObservable, observable } from 'mobx';
import { NFTTokenStore } from './NFTToken.store';
import { RootStore } from './Root.store';

export class NFTStore {
  @observable public collections: CollectionOwnership[];
  @observable public tokens: NFTTokenStore[];
  @observable public isLoading: boolean;

  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.collections = [];
    this.tokens = [];
    this.isLoading = true;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    await this.getTokens();
  }

  public async getTokens(): Promise<void> {
    this.setIsLoading(true);
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;

    if (deviceId && accountId !== undefined && accessToken) {
      const myCollections = await getNFTCollections(deviceId, accessToken);
      const myTokens = await getNFTTokens(deviceId, accountId, accessToken);

      this.setCollections(myCollections);
      this.setTokens(myTokens);
    }

    this.setIsLoading(false);
  }

  @action
  public setCollections(dto: CollectionOwnership[]): void {
    this.collections = [];
    this.collections = dto;
  }

  @action
  public setTokens(dto: TokenWithBalance[]): void {
    this.tokens = [];
    dto.map((t) => {
      const tokenStore = new NFTTokenStore(t, this._rootStore);
      this.tokens.push(tokenStore);
    });
  }

  @action
  public setIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }
}
