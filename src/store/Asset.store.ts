import { IAssetBalanceDTO, IAssetDTO } from '@api';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class AssetStore {
  @observable public data: IAssetDTO;
  @observable public balance: IAssetBalanceDTO | null;

  private _rootStore: RootStore;

  constructor(dto: IAssetDTO, balance: IAssetBalanceDTO | null, rootStore: RootStore) {
    this.data = dto;
    this.balance = balance;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public setBalance(balance: IAssetBalanceDTO): void {
    this.balance = null;
    this.balance = balance;
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
  public get availableBalance(): string {
    return this.balance?.available || '0';
  }

  @computed
  public get availableBalanceInUSD(): string {
    if (this.data.rate) {
      return `${Number(this.availableBalance) * this.data.rate}`;
    }

    return '--';
  }

  @computed
  public get rate(): string {
    if (this.data.rate) {
      return this.data.rate.toLocaleString('en-IN', { style: 'currency', currency: 'USD' });
    }

    return '0';
  }
}
