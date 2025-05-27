// Firebase Cloud Messaging Service Worker

// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA2E5vK3fhxvftpfS02T8eIC3SrXnIUjrs',
  authDomain: 'fireblocks-sdk-demo.firebaseapp.com',
  projectId: 'fireblocks-sdk-demo',
  storageBucket: 'fireblocks-sdk-demo.appspot.com',
  messagingSenderId: '127498444203',
  appId: '1:127498444203:web:31ff24e7a4c6bfa92e46ee',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification.body || 'Background Message body.',
    icon: '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM] Notification click: ', event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      }),
  );
});
