import { User } from 'firebase/auth';

export interface IUser {
  displayName: string | null;
  email: string | null;
  uid: string;
}

export interface IAuthManager {
  getGoogleDriveCredentials(): Promise<string>;
  login(provider: 'GOOGLE' | 'APPLE'): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): Promise<string>;
  onUserChanged(callback: (user: IUser | null) => void): () => void;
  get loggedUser(): User | null;

  // Firebase Cloud Messaging methods
  /**
   * Initializes the Firebase Cloud Messaging service.
   * This should be called before using any other messaging methods.
   */
  initializeMessaging(): Promise<void>;

  /**
   * Requests permission to show notifications.
   * @returns A promise that resolves to a boolean indicating whether permission was granted.
   */
  requestNotificationPermission(): Promise<boolean>;

  /**
   * Gets the FCM token for the current device.
   * @param vapidKey The VAPID key for web push notifications.
   * @returns A promise that resolves to the FCM token or null if it couldn't be retrieved.
   */
  getMessagingToken(vapidKey?: string): Promise<string | null>;

  /**
   * Sets up a listener for incoming messages.
   * @param callback The function to call when a message is received.
   * @returns A function to unsubscribe from the message listener.
   */
  onMessage(callback: (payload: any) => void): () => void;

  /**
   * Retrieves the VAPID public key required for FCM web push notifications.
   * @returns A Promise that resolves to the VAPID public key string.
   */
  getVapidPublicKey(): Promise<string>;

  /**
   * Registers a device token for push notifications with the backend server.
   * @param deviceToken The FCM token to register
   * @param walletId The ID of the wallet to associate with this device token
   * @param deviceId The unique identifier for the device
   */
  registerDeviceToken(deviceToken: string, walletId: string, deviceId: string): Promise<void>;

  /**
   * Helper function to set up push notifications in one call.
   * This function:
   * 1. Initializes messaging
   * 2. Requests permission
   * 3. Gets the messaging token
   * 4. Sets up a message listener
   *
   * @param deviceId The ID of the device.
   * @param walletId The ID of the wallet. This is used to identify the user in the backend.
   * @param onMessageCallback The function to call when a message is received.
   * @returns A promise that resolves to the FCM token or null if setup failed.
   */
  setupPushNotifications(
    deviceId: string,
    walletId: string,
    onMessageCallback?: (payload: any) => void,
  ): Promise<string | null>;

  /**
   * Aborts the messaging process by unsubscribing from the message listener.
   * This should be called when the user logs out or when you want to stop receiving messages.
   */
  abortMessaging(): void;
}
