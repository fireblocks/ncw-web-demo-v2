import { TokenWithBalance } from 'fireblocks-sdk';
import { makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class NFTTokenStore {
  @observable public id: string;
  @observable public tokenId: string;
  @observable public ownershipStartTime: number;
  @observable public blockchainDescriptor: string;
  @observable public collectionName: string;
  @observable public collectionId: string;
  @observable public standard: string;
  @observable public name: string;
  @observable public imageUrl: string | null;

  private _rootStore: RootStore;

  constructor(tokenDTO: TokenWithBalance, rootStore: RootStore) {
    this.blockchainDescriptor = tokenDTO.blockchainDescriptor;
    this.id = tokenDTO.id;
    this.collectionName = tokenDTO.collection?.name || '';
    this.collectionId = tokenDTO.collection?.id || '';
    this.standard = tokenDTO.standard;
    this.tokenId = tokenDTO.tokenId;
    this.ownershipStartTime = tokenDTO.ownershipStartTime;
    this.name = tokenDTO.name || 'No name';

    if (tokenDTO.media && tokenDTO.media[0]?.url) {
      this.imageUrl = tokenDTO.media[0].url;
    } else {
      this.imageUrl = null;
    }

    this._rootStore = rootStore;

    makeObservable(this);
  }
}
