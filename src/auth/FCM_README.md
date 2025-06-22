# Firebase Cloud Messaging Integration

This document provides instructions on how to use the Firebase Cloud Messaging (FCM) functionality that has been integrated into the `FirebaseAuthManager` class.

## Overview

Firebase Cloud Messaging (FCM) allows you to send push notifications to users of your application. The implementation in `FirebaseAuthManager` provides methods to:

1. Initialize the messaging service
2. Request notification permission from the user
3. Get the FCM token for the device
4. Listen for incoming messages
5. Set up all of the above with a single helper function

## Prerequisites

Before using FCM, you need:

1. A Firebase project with Cloud Messaging enabled
2. A backend service configured to handle device token registration
3. A service worker file (`firebase-messaging-sw.js`) in the `public` directory of your project (already created)
4. Valid device and wallet IDs for registration

Note: The VAPID key is automatically fetched from the backend, with a fallback to environment configuration.

## Usage

### Basic Setup

The simplest way to set up push notifications is to use the `setupPushNotifications` helper function:

```typescript
import { getAuthManager } from './auth';

async function enablePushNotifications() {
  const authManager = getAuthManager();

  // Set up push notifications with device and wallet IDs
  const deviceId = 'your-device-id';  // Unique identifier for this device
  const walletId = 'your-wallet-id';  // The user's wallet ID

  // Set up push notifications and get the FCM token
  const token = await authManager.setupPushNotifications(
    deviceId,
    walletId,
    (payload) => {
      console.log('Received message:', payload);
      // Handle the message (e.g., show a notification)
    }
  );

  if (token) {
    console.log('Push notifications enabled successfully');
    // The token is automatically registered with the backend
  } else {
    console.log('Failed to enable push notifications');
  }
}
```

### Manual Setup

// Note: The following section shows how to manually implement each step

If you need more control, you can use the individual methods:

```typescript
import { getAuthManager } from './auth';

async function manualSetup() {
  const authManager = getAuthManager();
  const deviceId = 'your-device-id';
  const walletId = 'your-wallet-id';

  try {
    // Step 1: Initialize messaging
    await authManager.initializeMessaging();

    // Step 2: Request permission
    const permissionGranted = await authManager.requestNotificationPermission();
    if (!permissionGranted) {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    // Step 3: Get VAPID public key
    const vapidKey = await authManager.getVapidPublicKey();

    // Step 4: Get the messaging token
    const token = await authManager.getMessagingToken(vapidKey);
    if (!token) {
      console.log('[FCM] Failed to get messaging token');
      return null;
    }

    // Step 5: Register the token with the backend
    await authManager.registerDeviceToken(token, walletId, deviceId);

    // Step 6: Set up message listener
    const unsubscribe = authManager.onMessage((payload) => {
      console.log('[FCM] Message received:', payload);
      // Handle the message
    });

    console.log('[FCM] Push notifications set up successfully');
    return token;

    // To stop listening for messages later:
    // unsubscribe();
  } catch (error) {
    console.error('[FCM] Error setting up push notifications:', error);
    return null;
  }
}
```

## Message Handling

When you receive a message from Firebase Cloud Messaging, the payload typically has the following structure:

```typescript
type MessagePayload = {
  notification?: {
    title: string;
    body: string;
    image?: string;
  };
  data?: {
    type?: 'transaction' | 'backup' | 'device';
    [key: string]: string | undefined;
  };
  // Additional Firebase messaging fields may be present
};
```

### Best Practices for Message Handling

Note: The message payload structure follows the Firebase Cloud Messaging format. Your backend can customize the payload structure within these constraints.


Here's an example of a comprehensive message handler:

```typescript
function handlePushNotification(payload: any): void {
  console.log('Received push notification:', payload);

  try {
    // Extract notification details
    const { notification, data } = payload;

    // Handle different types of notifications based on data
    if (data?.type === 'transaction') {
      console.log('Transaction notification received:', data);
      // Refresh transaction data
      refreshTransactions();
    } else if (data?.type === 'backup') {
      console.log('Backup notification received:', data);
      // Refresh backup status
      checkBackupStatus();
    } else if (data?.type === 'device') {
      console.log('Device notification received:', data);
      // Refresh devices
      refreshDevices();
    } else {
      console.log('Generic notification received');
    }

    // Show a browser notification if the app is in the background
    if (notification && 'Notification' in window && Notification.permission === 'granted') {
      // Check if the app is in focus
      if (document.visibilityState !== 'visible') {
        new Notification(notification.title || 'New Notification', {
          body: notification.body || 'You have a new notification',
          icon: '/favicon.ico'
        });
      }
    }
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
}
```

### Message Types

You can define different types of messages by including a `type` field in the `data` object when sending the notification. For example:

- Transaction notifications: `data: { type: 'transaction', txId: '123', status: 'completed' }`
- Backup notifications: `data: { type: 'backup', status: 'completed' }`
- Device notifications: `data: { type: 'device', action: 'added' }`

## Sending Test Notifications

You can send test notifications from the Firebase Console:

1. Go to the Firebase Console
2. Select your project
3. Navigate to "Cloud Messaging"
4. Click "Send your first message"
5. Fill in the notification details
6. Under "Target", select "Single device" and enter the FCM token
7. Click "Send message"

## Troubleshooting
If you encounter issues with push notifications:

1. Check that the service worker is registered correctly
2. Ensure that notification permissions are granted
3. Check that your device and wallet IDs are valid
4. Verify the backend connection and registration endpoint
5. Check the browser console for FCM-related logs (prefixed with '[FCM]')
6. Make sure the device is online
7. Verify that the backend registration was successful

Common Issues:
- If token registration fails, the setup process will continue but notifications might not work properly
- The VAPID key is automatically managed, so errors about invalid VAPID keys might indicate backend issues
- If messages aren't being received, check if the token was successfully registered with the backend


## Browser Support

Firebase Cloud Messaging is supported in:
- Chrome (desktop and Android)
- Firefox
- Edge
- Safari (partial support)
- Opera

## Additional Notes

- Device tokens are automatically registered with the backend when calling `setupPushNotifications`
- The VAPID key is fetched from the backend with a fallback to environment configuration
- Message listeners can be cleaned up using the `abortMessaging` method
- Token registration is tied to specific device and wallet IDs for proper message routing

For more details about the implementation, check the `FirebaseAuthManager.ts` file.

For more information about Firebase Cloud Messaging, refer to:
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Notifications Guide](https://firebase.google.com/docs/cloud-messaging/js/first-message)
