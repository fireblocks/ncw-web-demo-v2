import { IDeviceDTO, getDevices, getUserId } from '@api';
import { FirebaseAuthManager, IAuthManager, IUser } from '@auth';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';

export class UserStore {
  @observable public loggedUser: IUser | null;
  @observable public isGettingUser: boolean;
  @observable public hasBackup: boolean;
  @observable public isCheckingBackup: boolean;
  @observable public accessToken: string;
  @observable public userId: string;
  @observable public myDevices: IDeviceDTO[];
  @observable public error: string;

  private _authManager: IAuthManager;
  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.loggedUser = null;
    this.isGettingUser = false;
    this.hasBackup = false;
    this.isCheckingBackup = false;
    this.accessToken = '';
    this.error = '';
    this.userId = '';
    this.myDevices = [];

    this._rootStore = rootStore;
    console.log('[Auth] Initializing UserStore');

    this._authManager = new FirebaseAuthManager();

    this._authManager.onUserChanged((user) => {
      console.log('[Auth] User changed event received', user ? 'User logged in' : 'User logged out');
      this.setUser(user);
    });

    makeObservable(this);
  }

  public login(provider: 'GOOGLE' | 'APPLE'): void {
    console.log(`[Auth] Starting login with ${provider} provider`);
    this.setIsGettingUser(true);
    this._authManager
      .login(provider)
      .then(() => {
        if (this._authManager.loggedUser) {
          console.log('[Auth] Login successful');
          this.setUser(this._authManager.loggedUser);
        } else {
          console.log('[Auth] Login completed but no user returned');
        }
      })
      .catch((e) => {
        console.error('[Auth] Login error:', e);
        this.setError(e.message);
      });
  }

  public logout(): void {
    console.log('[Auth] Starting logout');
    this._authManager
      .logout()
      .then(() => {
        console.log('[Auth] Logout successful');
        this.clearStoreData();
      })
      .catch((e) => {
        console.error('[Auth] Logout error:', e);
        this.setError(e.message);
      });
  }

  public restartWallet(): void {
    window.localStorage.clear();
  }

  public getAccessToken(): Promise<string> {
    console.log('[Auth] Getting access token');
    if (!this.loggedUser) {
      console.error('[Auth] Cannot get access token - user not logged in');
      throw new Error('User is not logged in');
    }

    return this._authManager.getAccessToken();
  }

  public async resetAccessToken() {
    if (this.loggedUser) {
      try {
        const token = await this._authManager.getAccessToken();
        this.setAccessToken(token);
      } catch (error: any) {
        this.setError(error.message);
      }
    }
  }

  @action
  public setUser(user: IUser | null) {
    console.log('[Auth] Setting user:', user ? `${user.displayName} (${user.email})` : 'null');
    this.loggedUser = user;
    if (user) {
      this._authManager
        .getAccessToken()
        .then((token) => {
          console.log('[Auth] Access token obtained');
          this.setAccessToken(token);
          getUserId(token)
            .then((userId) => {
              console.log('[Auth] User ID obtained:', userId);
              this.setUserId(userId);
              this.getMyDevices();
              this.setIsGettingUser(false);
            })
            .catch((e) => {
              console.error('[Auth] Error getting user ID:', e);
              this.setError(e.message);
            });
        })
        .catch((e) => {
          console.error('[Auth] Error getting access token:', e);
          this.setError(e.message);
        });
    } else {
      console.log('[Auth] User cleared/logged out');
    }
  }

  @action
  public setIsCheckingBackup(isCheckingBackup: boolean) {
    this.isCheckingBackup = isCheckingBackup;
  }

  @action
  public setError(error: string) {
    this.error = error;
  }

  @action
  public setHasBackup(hasBackup: boolean) {
    this.hasBackup = hasBackup;
  }

  @action
  public setMyDevices(devices: IDeviceDTO[]) {
    this.myDevices = devices;
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
  public setIsGettingUser(value: boolean) {
    this.isGettingUser = value;
  }

  @action
  public clearStoreData() {
    this.setHasBackup(false);
    this.setUser(null);
    this.setAccessToken('');
    this.setUserId('');
    this.setError('');
    this._rootStore.transactionsStore.dispose();
    this._rootStore.fireblocksSDKStore.clearData();
    this._rootStore.authStore.setStatus(null);
    localStorage.removeItem('VISITED_PAGE');
  }

  @computed
  public get userDisplayName(): string {
    return this.loggedUser?.displayName || '';
  }

  @computed
  public get userShortDisplayName(): string {
    return this.userDisplayName[0];
  }

  @computed
  public get myLatestActiveDevice(): IDeviceDTO | null {
    if (this.myDevices.length > 0) {
      return this.myDevices[this.myDevices.length - 1];
    }
    return null;
  }

  public checkLatestBackup(device: IDeviceDTO): void {
    this.setIsCheckingBackup(true);
    this._rootStore.backupStore
      .getMyLatestBackup(device.walletId)
      .then((result) => {
        if (result) {
          this.setHasBackup(true);
        }
      })
      .catch((e) => {
        throw new Error(e.message);
      })
      .finally(() => {
        this.setIsCheckingBackup(false);
      });
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

  public getMyDevices(): void {
    console.log('[Auth] Getting user devices');
    if (!this.loggedUser) {
      this.setError('User is not logged in');
    }

    getDevices(this.accessToken)
      .then((devices) => {
        console.log('[Auth] Devices retrieved:', devices.length);
        this.setMyDevices(devices);
        if (devices?.length) {
          this.checkLatestBackup(devices[devices.length - 1]);
        }
      })
      .catch((e) => {
        console.error('[Auth] Error getting devices:', e);
        this.setError(e.message);
      });
  }
}
