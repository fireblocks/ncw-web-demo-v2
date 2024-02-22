import { IAssetDTO } from '@api';
import { computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class AssetStore {
  @observable public data: IAssetDTO;

  private _rootStore: RootStore;

  constructor(dto: IAssetDTO, rootStore: RootStore) {
    this.data = dto;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @computed
  public get id(): string {
    return this.data.id;
  }

  @computed
  public get symbol(): string {
    return this.data.symbol;
  }

  @computed
  public get iconUrl(): string {
    return this.data.iconUrl || '';
  }

  @computed
  public get name(): string {
    return this.data.name;
  }

  @computed
  public get rate(): number {
    return this.data.rate || 0;
  }
}
