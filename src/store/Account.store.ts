import { IAccountDTO } from '@api';
import { computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';
/* tslint:disable:no-unused-variable */
/**
 * AccountStore represents a single account in the system.
 * It stores account data and provides access to account properties.
 */
export class AccountStore {
  /** The account data transfer object containing all account information */
  @observable public data: IAccountDTO;

  /** Reference to the root store for accessing other stores */
  private _rootStore: RootStore;

  /**
   * Initializes the AccountStore with account data and a reference to the root store
   * @param dto The account data transfer object
   * @param rootStore Reference to the root store
   */
  constructor(dto: IAccountDTO, rootStore: RootStore) {
    this.data = dto;
    this._rootStore = rootStore;

    makeObservable(this);
  }

  /**
   * Gets the unique identifier for this account
   * @returns The account ID
   */
  @computed
  public get accountId(): number {
    return this.data.accountId;
  }
}
