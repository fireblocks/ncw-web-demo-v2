import { IAccountDTO } from '@api';
import { makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class AccountStore {
  @observable public data: IAccountDTO;

  private _rootStore: RootStore;

  constructor(dto: IAccountDTO, rootStore: RootStore) {
    this.data = dto;
    this._rootStore = rootStore;

    makeObservable(this);
  }
}
