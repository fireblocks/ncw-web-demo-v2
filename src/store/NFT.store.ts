import { getNFTCollections, getNFTTokens } from '@api';
import { CollectionOwnership, TokenWithBalance } from 'fireblocks-sdk';
import { action, makeObservable, observable } from 'mobx';
import { NFTTokenStore } from './NFTToken.store';
import { RootStore } from './Root.store';

/**
 * NFTStore manages NFT collections and tokens owned by the user.
 * It provides methods for fetching, storing, and accessing NFT data.
 */
export class NFTStore {
  @observable public collections: CollectionOwnership[];
  @observable public tokens: NFTTokenStore[];
  @observable public isLoading: boolean;
  @observable public isRefreshingGallery: boolean;

  private _rootStore: RootStore;

  /**
   * Initializes the NFTStore with default values and a reference to the root store
   * @param rootStore Reference to the root store
   */
  constructor(rootStore: RootStore) {
    this.collections = [];
    this.tokens = [];
    this.isLoading = true;
    this.isRefreshingGallery = false;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public async init(): Promise<void> {
    await this.getTokens(true);
  }

  public async getTokens(initMode?: boolean): Promise<void> {
    initMode ? this.setIsLoading(true) : this.setIsRefreshingGallery(true);

    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;
    const accountId = this._rootStore.accountsStore.currentAccount?.accountId;

    if (deviceId && accountId !== undefined && accessToken) {
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const myCollections = await getNFTCollections(deviceId, accessToken, this._rootStore);
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      const myTokens = await getNFTTokens(deviceId, accountId, accessToken, this._rootStore);

      this.setCollections(myCollections);
      this.setTokens(myTokens);
    }

    initMode ? this.setIsLoading(false) : this.setIsRefreshingGallery(false);
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

  @action
  public setIsRefreshingGallery(isRefreshingGallery: boolean): void {
    this.isRefreshingGallery = isRefreshingGallery;
  }

  public get(id: string): NFTTokenStore | undefined {
    return this.tokens.find((t) => t.id === id);
  }
}
