import { IAccountDTO } from '@api';
import { computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';
/* tslint:disable:no-unused-variable */
export class AccountStore {
  @observable public data: IAccountDTO;

  private _rootStore: RootStore;

  constructor(dto: IAccountDTO, rootStore: RootStore) {
    this.data = dto;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  @computed
  public get accountId(): number {
    return this.data.accountId;
  }
}
