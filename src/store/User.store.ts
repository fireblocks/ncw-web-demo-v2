import { FirebaseAuthManager, IAuthManager, IUser } from '@auth';
import { action, computed, makeObservable, observable } from 'mobx';

export class UserStore {
  @observable public loggedUser: IUser | null;
  @observable public storeIsReady: boolean;

  private _authManager: IAuthManager;
  private _error: string;

  constructor() {
    this.loggedUser = null;
    this.storeIsReady = false;

    this._error = '';
    this._authManager = new FirebaseAuthManager();

    this._authManager.onUserChanged((user) => {
      if (user) {
        this.setUser(user);
      } else {
        this.setStoreIsReady(true);
      }
    });

    makeObservable(this);
  }

  public login(provider: 'GOOGLE' | 'APPLE'): void {
    this._authManager
      .login(provider)
      .then(() => {
        if (this._authManager.loggedUser) {
          this.setUser(this._authManager.loggedUser);
        }
      })
      .catch((error) => {
        this.setError(error.message);
      });
  }

  @action
  public setUser(user: IUser) {
    this.loggedUser = user;
    this.setStoreIsReady(true);
  }

  @action
  public setError(error: string) {
    this._error = error;
  }

  @action
  public setStoreIsReady(isReady: boolean) {
    this.storeIsReady = isReady;
  }

  @computed
  public get userDisplayName(): string {
    return this.loggedUser?.displayName || '';
  }
}
