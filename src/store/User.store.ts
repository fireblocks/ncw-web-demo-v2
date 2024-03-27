import { generateNewDeviceId, getUserId } from '@api';
import { FirebaseAuthManager, IAuthManager, IUser } from '@auth';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class UserStore {
  @observable public loggedUser: IUser | null;
  @observable public storeIsReady: boolean;
  @observable public accessToken: string;
  @observable public userId: string;
  @observable public error: string;

  private _authManager: IAuthManager;
  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.loggedUser = null;
    this.storeIsReady = false;
    this.accessToken = '';
    this.error = '';
    this.userId = '';

    this._rootStore = rootStore;

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
      .catch((e) => {
        this.setError(e.message);
      });
  }

  public logout(): void {
    this._authManager
      .logout()
      .then(() => {
        this.clearStoreData();
      })
      .catch((e) => {
        this.setError(e.message);
      });
  }

  public restartWallet(): void {
    generateNewDeviceId(this.userId);
  }

  public getAccessToken(): Promise<string> {
    if (!this.loggedUser) {
      throw new Error('User is not logged in');
    }

    return this._authManager.getAccessToken();
  }

  @action
  public setUser(user: IUser | null) {
    this.loggedUser = user;
    if (user) {
      this._authManager
        .getAccessToken()
        .then((token) => {
          this.setAccessToken(token);
          getUserId(token)
            .then((userId) => {
              this.setUserId(userId);
            })
            .catch((e) => {
              this.setError(e.message);
            });
        })
        .catch((e) => {
          this.setError(e.message);
        });
    }
    this.storeIsReady = true;
  }

  @action
  public setError(error: string) {
    this.error = error;
  }

  @action
  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  @action
  public setUserId(userId: string) {
    this.userId = userId;
  }

  @action
  public clearStoreData() {
    this.setUser(null);
    this.setAccessToken('');
    this.setUserId('');
    this.setError('');
    localStorage.removeItem('VISITED_PAGE');
    this._rootStore.fireblocksSDKStore.clearData();
  }

  @computed
  public get userDisplayName(): string {
    return this.loggedUser?.displayName || '';
  }

  @computed
  public get userShortDisplayName(): string {
    return this.userDisplayName[0];
  }

  public getGoogleDriveCredentials(): Promise<string> {
    if (!this.loggedUser) {
      this.setError('User is not logged in');
    }

    return this._authManager.getGoogleDriveCredentials();
  }

  public getGoogleDriveUserInfo(): IUser | null {
    if (!this.loggedUser) {
      this.setError('User is not logged in');
    }

    return this._authManager.loggedUser;
  }
}
