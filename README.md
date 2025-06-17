# Fireblocks NCW Web Demo v2

This is a demo project showcasing the integration of Fireblocks' Non-Custodial Wallet (NCW) with a web application. The demo demonstrates how to implement a secure cryptocurrency wallet solution using Fireblocks' technology with proxy backend and without proxy backend.
see .env file to adjust settings.

## 🚀 Features

- Secure wallet creation and management
- Asset management (view, send, receive)
- Transaction history
- Multi-chain support
- Real-time balance updates
- Secure key management

## 📋 Prerequisites

- Node.js (version specified in .nvmrc)
- Yarn package manager
- Fireblocks API credentials
- A Fireblocks account with NCW enabled

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-organization/ncw-web-demo-v2.git
cd ncw-web-demo-v2
```

Note: Replace the URL above with the actual repository URL.

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

### Option 1: Using Embedded Wallet SDK (Direct Integration)
```env
VITE_CLOUDKIT_APITOKEN=your-api-token
VITE_CLOUDKIT_CONTAINER_ID=your-container-id
VITE_CLOUDKIT_ENV=production

VITE_NCW_SDK_ENV=sandbox
VITE_USE_EMBEDDED_WALLET_SDK=true
VITE_BASE_FOLDER=/ncw-web-demo-v2/ew
VITE_BACKEND_BASE_URL=your-backend-url
VITE_AUTH_CLIENT_ID=your-client-id
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_USE_WEB_PUSH=true
```

### Option 2: Using Proxy Backend
```env
VITE_CLOUDKIT_APITOKEN=your-api-token
VITE_CLOUDKIT_CONTAINER_ID=your-container-id
VITE_CLOUDKIT_ENV=production

VITE_NCW_SDK_ENV=sandbox
VITE_USE_EMBEDDED_WALLET_SDK=false
VITE_BASE_FOLDER=/ncw-web-demo-v2
VITE_BACKEND_BASE_URL=your-backend-url
VITE_USE_WEB_PUSH=true
```

Note: Choose one of the options above based on your implementation needs. The key difference is the `VITE_USE_EMBEDDED_WALLET_SDK` setting, which determines whether the application uses direct integration with Fireblocks' Embedded Wallet SDK or communicates through a proxy backend server.

## 🏃‍♂️ Running the Application

1. Start the development server:
```bash
yarn dev
```

2. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── api-embedded-wallet/    # API integration with Fireblocks
├── components/             # Reusable UI components
├── pages/                 # Application pages
├── store/                 # State management
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔑 Key Components

- `WalletProvider`: Manages wallet state and operations
- `AssetStore`: Handles asset-related operations and state
- `TransactionStore`: Manages transaction history and operations
- `AuthStore`: Handles authentication and user session

## 🔄 API Integration

The project uses Fireblocks' API for:
- Wallet creation and management
- Asset operations
- Transaction processing
- Security operations

## 🛠️ Development

- The project uses TypeScript for type safety
- React with Vite for fast development
- MobX for state management
- Tailwind CSS for styling

## 📚 Documentation

For more information about Fireblocks NCW, refer to the [official documentation](https://developers.fireblocks.com/docs/non-custodial-wallet).

## 🔔 Push Notifications

This application uses Firebase Cloud Messaging (FCM) for push notifications. The implementation requires a service worker file (`firebase-messaging-sw.js`) to be available at the root path of the application.

### Transaction Updates Configuration

The application supports two methods for receiving transaction updates:

1. **Web Push Notifications** (default): Uses Firebase Cloud Messaging to receive real-time updates
2. **Regular Polling**: Periodically checks for updates at a fixed interval

You can configure which method to use with the `VITE_USE_WEB_PUSH` environment variable:

```env
# Use web push notifications (default)
VITE_USE_WEB_PUSH=true

# Use regular polling instead
VITE_USE_WEB_PUSH=false
```

When web push is disabled, the application will poll for transaction updates every 5-30 seconds (depending on the configuration).

### Service Worker Location

In development mode with Vite, the service worker file must be placed in the `public` directory to be served at the root path. This ensures that Firebase can register the service worker correctly.

```
public/
└── firebase-messaging-sw.js  # Service worker for Firebase Cloud Messaging
```

For more information about the Firebase Cloud Messaging implementation, see the [MESSAGING_README.md](src/auth/MESSAGING_README.md) file.

## ⚠️ Security Considerations

- Never commit your API keys or secrets
- Always use environment variables for sensitive data
- Follow security best practices when handling wallet operations
- Keep dependencies updated to the latest secure versions

## Architecture Overview

### Embedded Wallet vs Proxy Backend Implementation

The application supports two different modes of operation, controlled by the `USE_EMBEDDED_WALLET_SDK` environment variable:

1. **Embedded Wallet Mode** (`USE_EMBEDDED_WALLET_SDK=true`)
    - Direct integration with Fireblocks' Embedded Wallet SDK
    - Handles wallet operations locally in the browser
    - Manages MPC (Multi-Party Computation) keys directly
    - Provides enhanced security through local key management
    - Uses the `api-embedded-wallet` implementation

2. **Proxy Backend Mode** (`USE_EMBEDDED_WALLET_SDK=false`)
    - Uses a proxy backend server to communicate with Fireblocks
    - Delegates wallet operations to the backend
    - Manages keys through the proxy server
    - Provides simpler implementation with backend handling security
    - Uses the `api` implementation

#### Implementation Details

The application uses Vite's alias system to dynamically load the correct implementation based on the environment configuration. All imports use the `@api` alias, which Vite resolves to either the embedded wallet or proxy backend implementation:

```typescript
// All imports use the @api alias
import { getAssets } from '@api';

// Vite resolves this to either:
// - src/api-embedded-wallet/assets.embedded.api.ts (when USE_EMBEDDED_WALLET_SDK=true)
// - src/api/assets.api.ts (when USE_EMBEDDED_WALLET_SDK=false)
```

The actual implementation is determined by Vite's configuration:

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@api': process.env.USE_EMBEDDED_WALLET_SDK === 'true'
        ? path.resolve(__dirname, 'src/api-embedded-wallet')
        : path.resolve(__dirname, 'src/api')
    }
  }
});
```

This approach allows for:
- Clean, consistent imports throughout the codebase
- Easy switching between implementations
- No need to modify import statements when changing modes
- Type safety and IDE support through the alias

#### Key Differences

1. **Security Model**
    - Embedded Wallet: Local key management with MPC
    - Proxy Backend: Server-side key management

2. **Network Architecture**
    - Embedded Wallet: Direct communication with Fireblocks
    - Proxy Backend: Communication through proxy server

3. **Implementation Complexity**
    - Embedded Wallet: More complex but more secure
    - Proxy Backend: Simpler but requires trust in proxy

4. **Performance**
    - Embedded Wallet: Faster for local operations
    - Proxy Backend: Additional network latency

5. **Development**
    - Both modes maintain the same API interface
    - Environment variable controls the implementation
    - Easy to switch between modes for testing
    - Consistent import paths using Vite's alias system


## EW_Demo_app_flow.pdf → includes the flow for embedded wallet
