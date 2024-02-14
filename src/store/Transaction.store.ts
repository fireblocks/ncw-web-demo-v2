import { makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';
import { ITransactionData } from '@api';

export class TransactionStore {
  @observable public data: ITransactionData;

  private _rootStore: RootStore;

  constructor(dto: ITransactionData, rootStore: RootStore) {
    this.data = dto;
    this._rootStore = rootStore;

    makeObservable(this);
  }
}
