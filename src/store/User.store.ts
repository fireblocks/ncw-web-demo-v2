import { IDeviceDTO, TTransactionStatus, getDevices, getUserId } from '@api';
import { FirebaseAuthManager, IAuthManager, IUser } from '@auth';
import { action, computed, makeObservable, observable } from 'mobx';
import { ENV_CONFIG } from '../env_config.ts';
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
        this.setIsGettingUser(false); // Reset loading state when error occurs
      });
  }

  public logout(): void {
    // Unsubscribe from Firebase messaging before logging out
    this._authManager.abortMessaging();

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
        .then((token) => {
          this.setAccessToken(token);
          if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
            // direct
            if (this._authManager.loggedUser !== null) {
              const userFirebase = this._authManager.loggedUser;
              this.setUserId(userFirebase.uid);
            }
          } else {
            // proxy backend
            getUserId(token)
              .then((userId: string) => {
                this.setUserId(userId);
                this.getMyDevices();
                this.setIsGettingUser(false);
              })
              .catch((e: Error) => {
                this.setError(e.message);
              });
          }
        })
        .catch((e: Error) => {
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

  public checkLatestBackup(walletId?: string): void {
    this.setIsCheckingBackup(true);
    this._rootStore.backupStore
      .getMyLatestBackup(walletId)
      .then((result) => {
        if (result) {
          if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
            const devices: IDeviceDTO[] = [];
            result.keys?.forEach((key) => {
              devices.push({
                deviceId: key.deviceId,
                walletId: result.walletId,
                createdAt: new Date().getTime(), // Adding required property as number
              });
            });
            this.setMyDevices(devices);
          }
          this.setHasBackup(true);
        }
      })
      .catch((e: Error) => {
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

    // @ts-expect-error in embedded wallet masking we need rootStore, but we don't need it for proxy backend
    getDevices(this.accessToken, this._rootStore)
      .then((devices: IDeviceDTO[]) => {
        this.setMyDevices(devices);
        if (devices?.length || ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
          const walletId = devices?.at(-1)?.walletId;
          this.checkLatestBackup(walletId);
        }
      })
      .catch((e: Error) => {
        this.setError(e.message);
      });
  }

  /**
   * Initializes Firebase messaging and sets up push notifications.
   * Should be called after user is logged in and device/wallet IDs are available.
   * Only initializes if USE_WEB_PUSH is true.
   */
  public async initializeAndSetupPushNotifications(): Promise<void> {
    // Skip FCM initialization if web push is disabled
    if (!ENV_CONFIG.USE_WEB_PUSH) {
      console.log('Web push notifications are disabled. Skipping FCM initialization.');
      return;
    }

    if (this.loggedUser && this._rootStore.deviceStore.deviceId && this._rootStore.deviceStore.walletId) {
      try {
        if (ENV_CONFIG.BACKEND_BASE_URL) {
          console.log('[FCM] Setting up push notifications.');
          await this._authManager.setupPushNotifications(
            this._rootStore.deviceStore.deviceId,
            this._rootStore.deviceStore.walletId,
            this.handlePushNotification.bind(this),
          );
        } else {
          console.warn('[FCM] BACKEND_BASE_URL is not configured. Skipping push notification setup.');
        }
      } catch (error) {
        console.error('[FCM] Error during push notifications setup:', error);
        this.setError('[FCM] Error setting up push notifications.');
      }
    } else {
      console.warn('[FCM] Cannot setup push notifications: User not logged in or deviceId/walletId missing.', {
        isUserLoggedIn: !!this.loggedUser,
        hasDeviceId: !!this._rootStore.deviceStore.deviceId,
        hasWalletId: !!this._rootStore.deviceStore.walletId,
      });
    }
  }

  /**
   * Handles incoming push notifications from Firebase Cloud Messaging.
   * This method is passed as a callback to the setupPushNotifications method.
   *
   * @param payload The notification payload received from Firebase
   */
  public handlePushNotification(payload: any): void {
    console.log('[FCM] Received push notification:', payload);

    try {
      // Extract notification details
      const { notification, data } = payload;

      // Handle different types of notifications based on data
      console.log('[FCM] data:', data);
      if (data?.type?.startsWith('transaction')) {
        console.log('[FCM] Transaction notification received:', data);

        // Process transaction update
        if (data.txId) {
          try {
            // Skip updating with basic data and directly fetch the full transaction data
            // This prevents multiple calls to updateOneFromWebPush
            console.log('[FCM] Fetching full transaction data for txId:', data.txId);
            this._rootStore.transactionsStore
              .fetchTransactionById(data.txId)
              .then(() => {
                console.log('[FCM] Successfully fetched full transaction data');
              })
              .catch((error) => {
                console.error('[FCM] Error fetching full transaction data:', error);
              });
          } catch (error) {
            console.error('[FCM] Error processing transaction data:', error);
          }
        } else {
          // If no transaction data is provided, fetch all transactions
          this._rootStore.transactionsStore.fetchTransactions();
        }
      } else if (data?.type === 'backup') {
        console.log('[FCM] Backup notification received:', data);
        // You could trigger a refresh of backup status here
        // this.checkLatestBackup();
      } else if (data?.type === 'device') {
        console.log('[FCM] Device notification received:', data);
        // You could trigger a refresh of devices here
        this.getMyDevices();
      } else {
        console.log('[FCM] Generic notification received');
      }

      // You could also show a browser notification here if the app is in the background
      if (notification && 'Notification' in window && Notification.permission === 'granted') {
        // Check if the app is in focus
        if (document.visibilityState !== 'visible') {
          new Notification(notification.title || 'New Notification', {
            body: notification.body || 'You have a new notification',
            icon: '/favicon.ico',
          });
        }
      }
    } catch (error) {
      console.error('[FCM] Error handling push notification:', error);
    }
  }
}
