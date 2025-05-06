import { IAssetAddressDTO, IAssetBalanceDTO, IAssetDTO } from '@api';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

/**
 * Formats a number as a localized currency string in USD
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const localizedCurrencyView = (amount: number): string =>
  amount.toLocaleString('en-IN', { style: 'currency', currency: 'USD' });

/** Placeholder text to display when a value is not available */
export const NOT_AVAILABLE_PLACEHOLDER = '--';

/**
 * AssetStore represents a single cryptocurrency asset in the system.
 * It stores asset data, balance information, and address details.
 */
export class AssetStore {
  /** Basic information about the asset (name, symbol, etc.) */
  @observable public assetData: IAssetDTO;

  /** Balance information for this asset */
  @observable public balanceData: IAssetBalanceDTO | null;

  /** Address information for this asset */
  @observable public addressData: IAssetAddressDTO | null;

  /** Reference to the root store for accessing other stores */
  private _rootStore: RootStore;

  /**
   * Initializes the AssetStore with asset data, balance data, address data, and a reference to the root store
   * @param assetDTO Basic information about the asset
   * @param balanceDTO Balance information for this asset
   * @param addressDTO Address information for this asset
   * @param rootStore Reference to the root store
   */
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

  /**
   * Updates the balance information for this asset
   * @param balance New balance information
   */
  @action
  public setBalance(balance: IAssetBalanceDTO): void {
    this.balanceData = null;
    this.balanceData = balance;
  }

  /**
   * Updates the address information for this asset
   * @param address New address information
   */
  @action
  public setAddress(address: IAssetAddressDTO): void {
    this.addressData = null;
    this.addressData = address;
  }

  /**
   * Gets the unique identifier for this asset
   * @returns The asset ID
   */
  @computed
  public get id(): string {
    return this.assetData.id;
  }

  /**
   * Gets the symbol for this asset (e.g., BTC, ETH)
   * @returns The asset symbol
   */
  @computed
  public get symbol(): string {
    return this.assetData.symbol;
  }

  /**
   * Gets the URL for the asset's icon
   * @returns The icon URL or empty string if not available
   */
  @computed
  public get iconUrl(): string {
    return this.assetData.iconUrl || '';
  }

  /**
   * Gets the full name of the asset
   * @returns The asset name
   */
  @computed
  public get name(): string {
    return this.assetData.name;
  }

  /**
   * Gets the total balance of this asset
   * @returns The total balance as a number (0 if not available)
   */
  @computed
  public get totalBalance(): number {
    return Number(this.balanceData?.total) || 0;
  }

  /**
   * Gets the wallet address for this asset
   * @returns The address or placeholder if not available
   */
  @computed
  public get address(): string {
    return this.addressData?.address || NOT_AVAILABLE_PLACEHOLDER;
  }

  /**
   * Gets the display name of the blockchain this asset belongs to
   * @returns The blockchain name or placeholder if not available
   */
  @computed
  public get blockChainName(): string {
    return this.assetData.blockchainDisplayName || NOT_AVAILABLE_PLACEHOLDER;
  }

  /**
   * Gets the base asset symbol for this asset
   * @returns The base asset symbol
   */
  @computed
  public get baseAsset(): string {
    return this.assetData.baseAsset;
  }

  /**
   * Gets the total balance of this asset converted to USD
   * @returns The total balance in USD as a formatted string or placeholder if rate is not available
   */
  @computed
  public get totalBalanceInUSD(): string {
    return this.assetData.rate
      ? localizedCurrencyView(Number(this.totalBalance) * this.assetData.rate)
      : NOT_AVAILABLE_PLACEHOLDER;
  }

  /**
   * Gets the exchange rate of this asset to USD
   * @returns The exchange rate as a formatted currency string or placeholder if not available
   */
  @computed
  public get rate(): string {
    return this.assetData.rate ? localizedCurrencyView(this.assetData.rate) : NOT_AVAILABLE_PLACEHOLDER;
  }

  /**
   * Gets the network protocol of this asset
   * @returns The network protocol
   */
  @computed
  public get networkProtocol(): string {
    return this.assetData.networkProtocol || '';
  }
}
