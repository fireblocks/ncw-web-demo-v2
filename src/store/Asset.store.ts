import { IAssetAddressDTO, IAssetBalanceDTO, IAssetDTO } from '@api';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export const localizedCurrencyView = (amount: number): string =>
  amount.toLocaleString('en-IN', { style: 'currency', currency: 'USD' });

export const NOT_AVAILABLE_PLACEHOLDER = '--';

export class AssetStore {
  @observable public assetData: IAssetDTO;
  @observable public balanceData: IAssetBalanceDTO | null;
  @observable public addressData: IAssetAddressDTO | null;

  private _rootStore: RootStore;

  constructor(
    assetDTO: IAssetDTO,
    balanceDTO: IAssetBalanceDTO | null,
    addressDTO: IAssetAddressDTO | null,
    rootStore: RootStore,
  ) {
    this.assetData = assetDTO;
    this.balanceData = balanceDTO;
    this.addressData = addressDTO;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @action
  public setBalance(balance: IAssetBalanceDTO): void {
    this.balanceData = null;
    this.balanceData = balance;
  }

  @action
  public setAddress(address: IAssetAddressDTO): void {
    this.addressData = null;
    this.addressData = address;
  }

  @computed
  public get id(): string {
    return this.assetData.id;
  }

  @computed
  public get symbol(): string {
    return this.assetData.symbol;
  }

  @computed
  public get iconUrl(): string {
    return this.assetData.iconUrl || '';
  }

  @computed
  public get name(): string {
    return this.assetData.name;
  }

  @computed
  public get totalBalance(): number {
    return Number(this.balanceData?.total) || 0;
  }

  @computed
  public get address(): string {
    return this.addressData?.address || NOT_AVAILABLE_PLACEHOLDER;
  }

  @computed
  public get blockChainName(): string {
    return this.assetData.blockchainDisplayName || NOT_AVAILABLE_PLACEHOLDER;
  }

  @computed
  public get baseAsset(): string {
    return this.assetData.baseAsset;
  }

  @computed
  public get totalBalanceInUSD(): string {
    return this.assetData.rate
      ? localizedCurrencyView(Number(this.totalBalance) * this.assetData.rate)
      : NOT_AVAILABLE_PLACEHOLDER;
  }

  @computed
  public get rate(): string {
    return this.assetData.rate ? localizedCurrencyView(this.assetData.rate) : NOT_AVAILABLE_PLACEHOLDER;
  }
}
