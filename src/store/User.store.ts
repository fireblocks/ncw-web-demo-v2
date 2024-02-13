import { FirebaseAuthManager, IAuthManager, IUser } from '@auth';
import { action, computed, makeObservable, observable } from 'mobx';

export class UserStore {
  @observable public loggedUser: IUser | null;
  @observable public storeIsReady: boolean;
  @observable public error: string;

  private _authManager: IAuthManager;

  constructor() {
    this.loggedUser = null;
    this.storeIsReady = false;

    this.error = '';
    this._authManager = new FirebaseAuthManager();

    this._authManager.onUserChanged((user) => {
      this.setUser(user);
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

  public logout(): void {
    this._authManager
      .logout()
      .then(() => {
        this.setUser(null);
      })
      .catch((error) => {
        this.setError(error.message);
      });
  }

  @action
  public setUser(user: IUser | null) {
    this.loggedUser = user;
    this.storeIsReady = true;
  }

  @action
  public setError(error: string) {
    this.error = error;
  }

  @computed
  public get userDisplayName(): string {
    return this.loggedUser?.displayName || '';
  }
}
