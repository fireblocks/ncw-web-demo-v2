import React, { useEffect } from 'react';
import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage } from '@pages';
import { useAssetsStore, useAuthStore, useNFTStore, useTransactionsStore, useUserStore, useEmbeddedWalletSDKStore, useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ENV_CONFIG } from './env_config';
import { consoleLog } from './utils/logger';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  backgroundColor: theme.palette.background.default,
}));

const ContentStyled = styled('div')(() => ({
  maxWidth: 1440,
  width: 1440,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

export const App: React.FC = observer(function App() {
  const userStore = useUserStore();
  const transactionsStore = useTransactionsStore();
  const authStore = useAuthStore();
  const assetsStore = useAssetsStore();
  const NFTStore = useNFTStore();
  const embeddedWalletSDKStore = useEmbeddedWalletSDKStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const [assetsInitialized, setAssetsInitialized] = React.useState(false);
  const lastVisitedPage = localStorage.getItem('VISITED_PAGE');
  
  // Improved logic to handle both SDK types - more permissive for embedded wallet
  const canShowDashboard = 
    // User must be logged in
    !!userStore.loggedUser && 
    // Auth store should be in READY state
    authStore.status === 'READY' &&
    // For embedded wallet, be more permissive - just require SDK initialization
    (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK ? 
      // For embedded wallet: just require SDK to be initialized
      embeddedWalletSDKStore.isInitialized : 
      // For regular SDK: require both SDK available and MPC keys ready
      fireblocksSDKStore.sdkStatus === 'sdk_available' && 
      fireblocksSDKStore.isMPCReady);

  // Add logging for debugging
  useEffect(() => {
    consoleLog('[App] App component rendered or updated');
    consoleLog('[App] Auth Status:', authStore.status);
    consoleLog('[App] User logged in:', !!userStore.loggedUser);
    consoleLog('[App] Embedded SDK in use:', ENV_CONFIG.USE_EMBEDDED_WALLET_SDK);
    
    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
      consoleLog('[App] Embedded SDK Ready:', embeddedWalletSDKStore.isReady);
      consoleLog('[App] Embedded SDK Initialized:', embeddedWalletSDKStore.isInitialized);
      consoleLog('[App] Embedded SDK MPC Generating:', embeddedWalletSDKStore.isMPCGenerating);
      consoleLog('[App] Embedded SDK MPC Ready:', embeddedWalletSDKStore.isMPCReady);
    } else {
      consoleLog('[App] Fireblocks SDK Status:', fireblocksSDKStore.sdkStatus);
      consoleLog('[App] Fireblocks SDK MPC Ready:', fireblocksSDKStore.isMPCReady);
    }
    
    consoleLog('[App] Can show dashboard:', canShowDashboard);
    consoleLog('[App] Need to generate keys:', authStore.needToGenerateKeys);
  }, [
    authStore.status, 
    userStore.loggedUser, 
    canShowDashboard, 
    authStore.needToGenerateKeys, 
    embeddedWalletSDKStore.isReady,
    embeddedWalletSDKStore.isInitialized,
    embeddedWalletSDKStore.isMPCGenerating,
    embeddedWalletSDKStore.isMPCReady,
    fireblocksSDKStore.sdkStatus,
    fireblocksSDKStore.isMPCReady
  ]);

  useEffect(
    () => () => {
      transactionsStore.dispose();
    },
    [transactionsStore],
  );

  useEffect(() => {
    if (userStore.userId) {
      consoleLog('[App] User ID found, initializing auth store');
      authStore.init().catch((error) => {
        console.error('[App] Error initializing auth store:', error);
      });
    }
  }, [userStore.userId, authStore]);

  useEffect(() => {
    // Try to initialize MPC keys if needed and user is logged in
    const initWallet = async () => {
      // Add a one-time flag to prevent multiple key generation calls
      const keyGenInProgress = localStorage.getItem('mpc_key_gen_in_progress');
      
      if (userStore.loggedUser && userStore.accessToken && authStore.needToGenerateKeys && !keyGenInProgress) {
        consoleLog('[App] Need to generate keys, initializing wallet');
        try {
          // Set flag before starting generation
          localStorage.setItem('mpc_key_gen_in_progress', 'true');
          await authStore.generateMPCKeys();
          consoleLog('[App] MPC keys generated successfully');
        } catch (error) {
          console.error('[App] Error generating MPC keys:', error);
        } finally {
          // Clear flag when done
          localStorage.removeItem('mpc_key_gen_in_progress');
        }
      }
    };

    initWallet();
  }, [userStore.loggedUser, userStore.accessToken, authStore.needToGenerateKeys]);

  // Separate useEffect for fetching assets to handle initialization state
  useEffect(() => {
    const fetchAssets = async () => {
      if (!assetsInitialized && canShowDashboard) {
        consoleLog('[App] Auth status is READY and SDK is ready, fetching assets...');
        try {
          await assetsStore.init();
          await NFTStore.init();
          setAssetsInitialized(true);
          consoleLog('[App] Assets initialized successfully');
        } catch (error) {
          console.error('[App] Error fetching assets:', error);
        }
      }
    };

    fetchAssets();
  }, [canShowDashboard, assetsStore, NFTStore, assetsInitialized]);

  return (
    <RootStyled>
      <ContentStyled>
        {canShowDashboard && <Header />}
        <Routes>
          {canShowDashboard ? (
            <>
              <Route path="assets" element={<AssetsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="nfts" element={<NFTsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to={lastVisitedPage || 'assets'} replace />} />
            </>
          ) : (
            <>
              <Route path="login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="login" replace />} />
            </>
          )}
        </Routes>
      </ContentStyled>
    </RootStyled>
  );
});
