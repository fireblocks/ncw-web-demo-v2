import { IDeviceDTO, getDevices, getUserId } from '@api';
import { FirebaseAuthManager, IAuthManager, IUser } from '@auth';
import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from './Root.store';
import { ENV_CONFIG } from '../env_config.ts';

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

    this._authManager = new FirebaseAuthManager();

    this._authManager.onUserChanged((user) => {
      this.setUser(user);
    });

    makeObservable(this);
  }

  public login(provider: 'GOOGLE' | 'APPLE'): void {
    this.setIsGettingUser(true);
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
    window.localStorage.clear();
  }

  public getAccessToken(): Promise<string> {
    if (!this.loggedUser) {
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
    this.loggedUser = user;
    if (user) {
      this._authManager
        .getAccessToken()
        .then(async (token): Promise<void> => {
          this.setAccessToken(token);
          if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
            // with embedded wallet
            if (this._authManager.loggedUser !== null) {
              const userFirebase = this._authManager.loggedUser;
              this.setUserId(userFirebase.uid); // this will also initialize the embedded wallet sdk
              // this.getMyDevices(); // todo: we should initialize the sdk core first, but it also want deviceId
              // this.setIsGettingUser(false);
            }
          } else {
            // with backend proxy
            getUserId(token)
              .then((userId) => {
                this.setUserId(userId);
                this.getMyDevices();
                this.setIsGettingUser(false);
              })
              .catch((e) => {
                this.setError(e.message);
              });
          }
        })
        .catch((e) => {
          this.setError(e.message);
        });
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

  public checkLatestBackup(device: IDeviceDTO = {}): void {
    this.setIsCheckingBackup(true);
    this._rootStore.backupStore
      .getMyLatestBackup(device.walletId ?? '')
      .then((result) => {
        if (result) {
          if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
            const devices = []
            result.keys.forEach((key) => {
              devices.push({
                deviceId: key.deviceId,
                walletId: key?.walletId ?? null,
              });
            });
            this.setMyDevices(devices);
          }
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
    if (!this.loggedUser) {
      this.setError('User is not logged in');
    }

    getDevices(this.accessToken, this._rootStore)
      .then((devices) => {
        this.setMyDevices(devices);
        if (devices?.length || ENV_CONFIG.USE_EMBEDDED_WALLET_SDK === 'true') {
          console.log('[UserStore] Checking latest backup');
          this.checkLatestBackup(devices?.length ? devices[devices.length - 1] : []);
        }
      })
      .catch((e) => {
        this.setError(e.message);
      });
  }
}
