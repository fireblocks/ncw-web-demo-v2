import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, AuthProvider, GoogleAuthProvider, OAuthProvider, User, getAuth, signInWithPopup } from 'firebase/auth';
import { Messaging, getMessaging, getToken, isSupported, onMessage as onFirebaseMessage } from 'firebase/messaging';
import { ENV_CONFIG } from '../env_config';
import { IAuthManager, IUser } from './IAuthManager';
import { getUserGoogleDriveProvider } from './providers';

const firebaseConfig = {
  apiKey: 'AIzaSyA2E5vK3fhxvftpfS02T8eIC3SrXnIUjrs',
  authDomain: 'fireblocks-sdk-demo.firebaseapp.com',
  projectId: 'fireblocks-sdk-demo',
  storageBucket: 'fireblocks-sdk-demo.appspot.com',
  messagingSenderId: '127498444203',
  appId: '1:127498444203:web:31ff24e7a4c6bfa92e46ee',
};

export class FirebaseAuthManager implements IAuthManager {
  private readonly _auth: Auth;
  private _authToken: string | null = null;
  private _loggedUser: User | null = null;

  private readonly _firebaseApp: FirebaseApp;
  private _messaging: Messaging | null = null;
  private _messageUnsubscribe: (() => void) | null = null;

  constructor() {
    this._firebaseApp = initializeApp(firebaseConfig);
    this._auth = getAuth(this._firebaseApp);
    this._loggedUser = this._auth.currentUser;
    this._auth.onAuthStateChanged((user) => {
      this._loggedUser = user;
    });
  }

  public async getGoogleDriveCredentials() {
    const provider = getUserGoogleDriveProvider(this._auth.currentUser!.email!);
    const result = await signInWithPopup(this._auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Failed to retrieve token');
    }
    return token;
  }

  public async login(provider: 'GOOGLE' | 'APPLE'): Promise<void> {
    let authProvider: AuthProvider;
    const googleProvider = new GoogleAuthProvider();

    switch (provider) {
      case 'GOOGLE':
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        authProvider = googleProvider;
        break;
      case 'APPLE':
        authProvider = new OAuthProvider('apple.com');
        break;
      default:
        throw new Error('Unsupported provider');
    }

    const unsubscribe = this._auth.onAuthStateChanged((user) => {
      this._loggedUser = user;
      unsubscribe();
    });

    try {
      const result = await signInWithPopup(this._auth, authProvider);
      this._loggedUser = result.user;
    } catch (error) {
      console.error('Authentication error:', error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }

  public logout(): Promise<void> {
    return this._auth.signOut();
  }

  public async getAccessToken(): Promise<string> {
    if (this._authToken) {
      return Promise.resolve(this._authToken);
    }

    if (!this._loggedUser) {
      throw new Error('User is not logged in');
    }

    this._authToken = await this._loggedUser.getIdToken();
    return this._authToken;
  }

  public get loggedUser(): User | null {
    return this._loggedUser;
  }

  public onUserChanged(callback: (user: IUser | null) => void): () => void {
    return this._auth.onAuthStateChanged(callback);
  }

  // Firebase Cloud Messaging methods

  /**
   * Initializes the Firebase Cloud Messaging service.
   * This should be called before using any other messaging methods.
   */
  public async initializeMessaging(): Promise<void> {
    try {
      // Check if the browser supports Firebase Cloud Messaging
      const isFCMSupported = await isSupported();

      if (!isFCMSupported) {
        throw new Error('[FCM] Firebase Cloud Messaging is not supported in this browser');
      }

      // Initialize the messaging service
      this._messaging = getMessaging(this._firebaseApp);

      console.log('[FCM] Firebase Cloud Messaging initialized successfully');
    } catch (error) {
      console.error('[FCM] Error initializing Firebase Cloud Messaging:', error);
      throw error;
    }
  }

  /**
   * Requests permission to show notifications.
   * @returns A promise that resolves to a boolean indicating whether permission was granted.
   */
  public async requestNotificationPermission(): Promise<boolean> {
    try {
      // Check if Notification API is available
      if (!('Notification' in window)) {
        console.error('[FCM] This browser does not support notifications');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[FCM] Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Retrieves the VAPID public key required for FCM web push notifications.
   *
   * First attempts to fetch the key from the backend service. If the request fails,
   * falls back to using the default VAPID public key from environment configuration.
   *
   * @returns A Promise that resolves to the VAPID public key string.
   * @throws Does not throw errors but logs them and returns the fallback key.
   */
  public async getVapidPublicKey(): Promise<string> {
    try {
      const authHeader = new Headers({ Authorization: `Bearer ${await this.getAccessToken()}` });

      const vapidPublicKeyResponse = await fetch(`${ENV_CONFIG.BACKEND_BASE_URL}/api/notifications/vapid-public-key`, {
        method: 'GET',
        headers: authHeader,
      });

      if (vapidPublicKeyResponse.ok && vapidPublicKeyResponse.status === 200) {
        const vapidPublicKey = await vapidPublicKeyResponse.json();
        console.log('[FCM] Successfully fetched VAPID public key from backend');
        return vapidPublicKey.data.publicKey;
      }

      console.error('[FCM] Failed to fetch VAPID public key:', await vapidPublicKeyResponse.text());
    } catch (error) {
      console.error('[FCM] Error fetching VAPID public key:', error);
    }

    // Fallback to default VAPID public key from ENV
    console.warn('[FCM] Using default VAPID public key from ENV');
    return ENV_CONFIG.VAPID_PUBLIC_KEY;
  }

  /**
   * Gets the FCM token for the current device.
   * @param vapidKey The VAPID key for web push notifications.
   * @returns A promise that resolves to the FCM token or null if it couldn't be retrieved.
   */
  public async getMessagingToken(vapidKey?: string): Promise<string | null> {
    try {
      if (!this._messaging) {
        await this.initializeMessaging();
      }

      if (!this._messaging) {
        throw new Error('[FCM] Messaging service is not initialized');
      }

      if (!vapidKey) {
        vapidKey = await this.getVapidPublicKey();
      }

      // Explicitly register the service worker
      let swRegistration;
      try {
        console.log('[FCM] Registering service worker...');
        // Use the base path from the environment config to construct the correct service worker URL
        const swUrl = `${window.location.origin}${ENV_CONFIG.BASE_FOLDER}/firebase-messaging-sw.js`;
        console.log(`[FCM] Service worker URL: ${swUrl}`);
        swRegistration = await navigator.serviceWorker.register(swUrl);
        console.log('[FCM] Service worker registered successfully:', swRegistration);
      } catch (swError) {
        console.error('[FCM] Error registering service worker:', swError);
        // Try to get existing registration as fallback
        swRegistration = await navigator.serviceWorker.getRegistration();
      }

      // Ensure service worker is activated before getting token
      if (swRegistration && (swRegistration.installing || swRegistration.waiting)) {
        console.log('[FCM] Service worker is installing or waiting, waiting for it to activate...');
        await new Promise<void>((resolve) => {
          const serviceWorker = swRegistration.installing || swRegistration.waiting;
          if (!serviceWorker) {
            resolve();
            return;
          }

          // If already activated, resolve immediately
          if (swRegistration.active && serviceWorker.state === 'activated') {
            console.log('[FCM] Service worker already activated');
            resolve();
            return;
          }

          // Listen for state changes
          const stateChangeListener = (e: Event) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              console.log('[FCM] Service worker activated successfully');
              serviceWorker.removeEventListener('statechange', stateChangeListener);
              resolve();
            }
          };

          serviceWorker.addEventListener('statechange', stateChangeListener);

          // Also set a timeout in case the state change event doesn't fire
          setTimeout(() => {
            serviceWorker.removeEventListener('statechange', stateChangeListener);
            console.log('[FCM] Service worker activation timeout - continuing anyway');
            resolve();
          }, 3000);
        });
      }

      // Get the token
      let currentToken = null;
      try {
        // First try with the service worker registration
        if (swRegistration) {
          currentToken = await getToken(this._messaging, {
            vapidKey,
            serviceWorkerRegistration: swRegistration,
          });
        }

        // If that fails, try without specifying the service worker registration
        if (!currentToken) {
          console.log('[FCM] Trying to get token without explicit service worker registration...');
          currentToken = await getToken(this._messaging, {
            vapidKey,
          });
        }
      } catch (tokenError) {
        console.error('[FCM] Error getting token:', tokenError);
      }

      if (!currentToken) {
        console.log('[FCM] No registration token available. Request permission to generate one.');
        return null;
      }

      console.log('[FCM] FCM registration token:', currentToken);
      return currentToken;
    } catch (error) {
      console.error('[FCM] Error getting messaging token:', error);
      return null;
    }
  }

  /**
   * Registers a device token for push notifications with the backend server.
   * This method sends the device token, platform, wallet ID, and device ID to the notification registration endpoint.
   *
   * @param deviceToken - The FCM (Firebase Cloud Messaging) token to register
   * @param walletId - The ID of the wallet to associate with this device token
   * @param deviceId - The unique identifier for the device
   * @returns A Promise that resolves when the registration attempt is complete (regardless of success or failure)
   *
   * @throws Does not throw errors - errors are logged but execution continues
   *
   * @remarks
   * - The method continues execution even if the backend registration fails
   * - Uses the current user's access token for authentication
   * - Registers specifically for the 'web-fcm' platform
   */
  public async registerDeviceToken(deviceToken: string, walletId: string, deviceId: string) {
    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${await this.getAccessToken()}`);
      headers.append('Content-Type', 'application/json');

      const requestBody = JSON.stringify({
        token: deviceToken,
        platform: 'web-fcm',
        walletId: walletId,
        deviceId: deviceId,
      });

      const tokenRegistrationResponse = await fetch(`${ENV_CONFIG.BACKEND_BASE_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });

      if (!tokenRegistrationResponse.ok) {
        console.error('[FCM] Failed to register token with backend:', await tokenRegistrationResponse.text());
      } else {
        console.log('[FCM] Successfully registered token with backend');
      }
    } catch (error) {
      console.error('[FCM] Error notifying backend of token:', error);
      // Continue with the setup even if backend notification fails
    }
  }

  /**
   * Sets up a listener for incoming messages.
   * @param callback The function to call when a message is received.
   * @returns A function to unsubscribe from the message listener.
   */
  public onMessage(callback: (payload: any) => void): () => void {
    if (!this._messaging) {
      console.error('[FCM] Messaging service is not initialized');
      return () => {};
    }

    return onFirebaseMessage(this._messaging, (payload) => {
      console.log('[FCM] Message received:', payload);
      callback(payload);
    });
  }

  /**
   * Helper function to set up push notifications in one call.
   * This function:
   * 1. Initializes messaging
   * 2. Requests permission
   * 3. Gets the messaging token
   * 4. Sets up a message listener
   *
   * @param vapidKey The VAPID key for web push notifications.
   * @param deviceId The ID of the device.
   * @param walletId The ID of the wallet. This is used to identify the user in the backend.
   * @param onMessageCallback The function to call when a message is received.
   * @returns A promise that resolves to the FCM token or null if setup failed.
   */
  public async setupPushNotifications(
    deviceId: string,
    walletId: string,
    onMessageCallback?: (payload: any) => void,
  ): Promise<string | null> {
    try {
      // Step 1: Initialize messaging
      await this.initializeMessaging();

      // Step 2: Request permission
      const permissionGranted = await this.requestNotificationPermission();
      if (!permissionGranted) {
        console.log('[FCM] Notification permission denied');
        return null;
      }

      // Step 3: Get VAPID public key
      const vapidKey: string = await this.getVapidPublicKey();

      // Step 4: Get the messaging token
      const token = await this.getMessagingToken(vapidKey);
      if (!token) {
        console.log('[FCM] Failed to get messaging token');
        return null;
      }

      // step 5: notify the backend of the token
      await this.registerDeviceToken(token, walletId, deviceId);

      // Step 6: Set up message listener (if callback provided)
      if (typeof onMessageCallback === 'function') {
        this._messageUnsubscribe = this.onMessage(onMessageCallback);
      } else {
        console.warn('[FCM] No valid onMessageCallback provided, skipping message listener setup');
      }

      console.log('[FCM] Finished setting up push notifications');
      return token;
    } catch (error) {
      console.error('[FCM] Error setting up push notifications:', error);
      return null;
    }
  }

  /**
   * Aborts the messaging process by unsubscribing from the message listener.
   * This should be called when the user logs out or when you want to stop receiving messages.
   */
  public abortMessaging(): void {
    if (this._messageUnsubscribe) {
      this._messageUnsubscribe();
      this._messageUnsubscribe = null;
      console.log('[FCM] Messaging process aborted');
    } else {
      console.log('[FCM] No active messaging process to abort');
    }
  }
}
