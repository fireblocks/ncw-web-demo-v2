import {
  ITransactionDTO,
  ITransactionDetailsDTO,
  TTransactionOperation,
  TTransactionStatus,
  cancelTransaction,
} from '@api';
import { TTransactionSignatureStatus } from '@fireblocks/ncw-js-sdk';
import { AssetStore, NOT_AVAILABLE_PLACEHOLDER, localizedCurrencyView } from '@store';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class TransactionStore {
  @observable public id: string;
  @observable public signatureStatus: TTransactionSignatureStatus | null;
  @observable public status: TTransactionStatus | null;
  @observable public createdAt: number | null;
  @observable public lastUpdated: number | null;
  @observable public details: ITransactionDetailsDTO | null;
  @observable public error: string;
  @observable public isSigning: boolean;

  private _rootStore: RootStore;

  constructor(dto: ITransactionDTO, rootStore: RootStore) {
    this.id = dto.id;
    this.signatureStatus = null;
    this.status = dto.status;
    this.createdAt = dto.createdAt || null;
    this.lastUpdated = dto.lastUpdated || null;
    this.details = dto.details || null;
    this.error = '';
    this.isSigning = false;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @computed
  public get assetId(): string {
    return this.details?.assetId || '';
  }

  @computed
  public get isNFT(): boolean {
    return this.assetId.includes('NFT-');
  }

  @computed
  public get sourceAddress(): string {
    return this.details?.sourceAddress || '';
  }

  @computed
  public get amount(): number {
    return this.details?.amount || 0;
  }

  @computed
  public get amountInUSD(): string {
    return this.details?.amountUSD ? localizedCurrencyView(this.details?.amountUSD) : NOT_AVAILABLE_PLACEHOLDER;
  }

  @computed
  public get fee(): string {
    return this.details?.feeInfo?.networkFee || NOT_AVAILABLE_PLACEHOLDER;
  }

  @computed
  public get destinationAddress(): string {
    if (this.isOutgoing) {
      return this.details?.destinationAddress || '';
    }

    return this.details?.sourceAddress || '';
  }

  @computed
  public get operationType(): TTransactionOperation | null {
    if (this.details?.operation) {
      return this.details?.operation as TTransactionOperation;
    }
    return null;
  }

  @computed
  public get isOutgoing(): boolean {
    return this.details?.source?.walletId === this._rootStore?.deviceStore?.walletId;
  }

  @computed
  public get cantBeCanceled(): boolean {
    return !!this?.status && ['COMPLETED', 'FAILED', 'CANCELLED', 'CONFIRMING', 'CANCELLING'].includes(this.status);
  }

  @computed
  public get isSubmitted(): boolean {
    return this?.status === 'SUBMITTED';
  }

  @computed
  public get isFinal(): boolean {
    switch (this.status) {
      case 'COMPLETED':
      case 'FAILED':
      case 'CANCELLED':
        return true;
      default:
        return false;
    }
  }

  @computed
  public get asset(): AssetStore | undefined {
    return this._rootStore.assetsStore.getAssetById(this.assetId);
  }

  @action
  public updateSignatureStatus(signatureStatus: TTransactionSignatureStatus) {
    this.signatureStatus = signatureStatus;
  }

  @action
  public updateStatus(status: TTransactionStatus) {
    this.status = status;

    // Only refresh balances for significant status changes
    const significantStatuses: TTransactionStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];
    if (this.isNFT) {
      this._rootStore.nftStore.getTokens().catch(() => {});
    } else if (significantStatuses.includes(status)) {
      // Only refresh the balance for the specific asset related to this transaction
      if (this.assetId) {
        console.log(
          `[Transaction] Refreshing balance for asset ${this.assetId} after transaction status change to ${status}`,
        );
        this._rootStore.assetsStore.refreshAssetBalance(this.assetId).catch((error) => {
          console.error(`[Transaction] Error refreshing balance for asset ${this.assetId}:`, error);
        });
      } else {
        console.warn('[Transaction] Cannot refresh asset balance: assetId is missing');
        // Fall back to refreshing all balances if assetId is missing
        this._rootStore.assetsStore.refreshBalances();
      }
    }
    this.setIsSigning(false);
  }

  @action
  public updateOne(status: TTransactionStatus) {
    this.status = status;

    // Only refresh balances for significant status changes
    const significantStatuses: TTransactionStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];
    if (this.isNFT) {
      this._rootStore.nftStore.getTokens().catch(() => {});
    } else if (significantStatuses.includes(status)) {
      // Only refresh the balance for the specific asset related to this transaction
      if (this.assetId) {
        console.log(
          `[Transaction] Refreshing balance for asset ${this.assetId} after transaction status change to ${status}`,
        );
        this._rootStore.assetsStore.refreshAssetBalance(this.assetId).catch((error) => {
          console.error(`[Transaction] Error refreshing balance for asset ${this.assetId}:`, error);
        });
      }
    }
    this.setIsSigning(false);
  }

  @action
  public setIsSigning(isSigning: boolean) {
    this.isSigning = isSigning;
  }

  @action
  public setError(error: string): void {
    this.error = error;
  }

  public signTransaction() {
    this.setIsSigning(true);
    this._rootStore.fireblocksSDKStore.sdkInstance
      ?.signTransaction(this.id)
      .then(() => {})
      .catch((e) => {
        this.setIsSigning(false);
        this.setError(e.message);
        this._rootStore.fireblocksSDKStore.sdkInstance
          ?.stopInProgressSignTransaction()
          .then(() => {})
          .catch((err) => {
            this.setError(err.message);
          });
      });
  }

  public cancelTransaction() {
    const deviceId = this._rootStore.deviceStore.deviceId;
    const accessToken = this._rootStore.userStore.accessToken;

    if (deviceId && accessToken) {
      this.updateStatus('CANCELLING');
      // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
      cancelTransaction(deviceId, accessToken, this.id, this._rootStore)
        .then(() => {
          this.updateStatus('CANCELLED');
        })
        .catch((e) => {
          this.setError(e.message);
        });
    }
  }

  @action
  public update(dto: ITransactionDTO) {
    this.createdAt = dto.createdAt || null;
    this.lastUpdated = dto.lastUpdated || null;
    this.details = dto.details || null;
    this.updateStatus(dto.status);
  }

  @action
  public updateOneFromWebPush(dto: ITransactionDTO) {
    this.createdAt = dto.createdAt || null;
    this.lastUpdated = dto.lastUpdated || null;
    this.details = dto.details || null;
    if (this.assetId) {
      this._rootStore.assetsStore.refreshAssetBalance(this.assetId).catch((error) => {
        console.error(`[Transaction] Error refreshing balance for asset ${this.assetId}:`, error);
      });
    }
  }
}
