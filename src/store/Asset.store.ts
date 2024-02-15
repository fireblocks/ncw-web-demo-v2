import { IAssetDTO } from '@api';
import { makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class AssetStore {
  @observable public data: IAssetDTO;

  private _rootStore: RootStore;

  constructor(dto: IAssetDTO, rootStore: RootStore) {
    this.data = dto;
    this._rootStore = rootStore;

    makeObservable(this);
  }
}
