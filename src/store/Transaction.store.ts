import { ITransactionDTO, ITransactionDetailsDTO, TTransactionStatus } from '@api';
import { TTransactionSignatureStatus } from '@fireblocks/ncw-js-sdk';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class TransactionStore {
  @observable public id: string;
  @observable public signatureStatus: TTransactionSignatureStatus | null;
  @observable public status: TTransactionStatus | null;
  @observable public createdAt: number | null;
  @observable public lastUpdated: number | null;
  @observable public details: ITransactionDetailsDTO | null;

  private _rootStore: RootStore;

  constructor(dto: ITransactionDTO, rootStore: RootStore) {
    this.id = dto.id;
    this.signatureStatus = null;
    this.status = dto.status;
    this.createdAt = dto.createdAt || null;
    this.lastUpdated = dto.lastUpdated || null;
    this.details = dto.details || null;

    this._rootStore = rootStore;

    makeObservable(this);
  }

  @computed
  public get assetId(): string {
    return this.details?.assetId || '';
  }

  @computed
  public get sourceAddress(): string {
    return this.details?.sourceAddress || '';
  }

  @action
  public updateSignatureStatus(signatureStatus: TTransactionSignatureStatus) {
    this.signatureStatus = signatureStatus;
  }

  @action
  public update(dto: ITransactionDTO) {
    this.status = dto.status;
    this.createdAt = dto.createdAt || null;
    this.lastUpdated = dto.lastUpdated || null;
    this.details = dto.details || null;
  }
}
