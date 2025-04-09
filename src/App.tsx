import React from 'react';
import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage } from '@pages';
import { useAssetsStore, useAuthStore, useNFTStore, useTransactionsStore, useUserStore, useEmbeddedWalletSDKStore, useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ENV_CONFIG } from './env_config';

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
  const lastVisitedPage = localStorage.getItem('VISITED_PAGE');
  
  // Updated logic to handle both SDK types
  const canShowDashboard = 
    // User must be logged in
    !!userStore.loggedUser && 
    // And either auth status is READY OR SDK is ready
    (authStore.status === 'READY' || 
     // For embedded wallet, check if SDK is initialized and MPC is ready
     (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK ? 
       embeddedWalletSDKStore.isReady : 
       fireblocksSDKStore.isMPCReady));

  // Add logging for debugging
  React.useEffect(() => {
    console.log('[App] Auth Status:', authStore.status);
    console.log('[App] User logged in:', !!userStore.loggedUser);
    console.log('[App] Embedded SDK in use:', ENV_CONFIG.USE_EMBEDDED_WALLET_SDK);
    if (ENV_CONFIG.USE_EMBEDDED_WALLET_SDK) {
      console.log('[App] Embedded SDK Ready:', embeddedWalletSDKStore.isReady);
      console.log('[App] Embedded SDK Initialized:', embeddedWalletSDKStore.isInitialized);
      console.log('[App] Embedded SDK MPC Ready:', embeddedWalletSDKStore.isMPCReady);
    } else {
      console.log('[App] Fireblocks SDK MPC Ready:', fireblocksSDKStore.isMPCReady);
    }
    console.log('[App] Can show dashboard:', canShowDashboard);
    console.log('[App] Need to generate keys:', authStore.needToGenerateKeys);
  }, [
    authStore.status, 
    userStore.loggedUser, 
    canShowDashboard, 
    authStore.needToGenerateKeys, 
    embeddedWalletSDKStore.isReady,
    embeddedWalletSDKStore.isInitialized,
    embeddedWalletSDKStore.isMPCReady,
    fireblocksSDKStore.isMPCReady
  ]);

  React.useEffect(
    () => () => {
      transactionsStore.dispose();
    },
    [transactionsStore],
  );

  React.useEffect(() => {
    if (userStore.userId) {
      console.log('[App] User ID found, initializing auth store');
      authStore.init().catch((error) => {
        console.error('[App] Error initializing auth store:', error);
      });
    }
  }, [userStore.userId, authStore]);

  React.useEffect(() => {
    // Try to initialize MPC keys if needed and user is logged in
    const initWallet = async () => {
      if (userStore.loggedUser && userStore.accessToken && authStore.needToGenerateKeys) {
        console.log('[App] Need to generate keys, initializing wallet');
        try {
          await authStore.generateMPCKeys();
          console.log('[App] MPC keys generated successfully');
        } catch (error) {
          console.error('[App] Error generating MPC keys:', error);
        }
      }
    };

    initWallet();
  }, [userStore.loggedUser, userStore.accessToken, authStore.needToGenerateKeys]);

  React.useEffect(() => {
    const fetchAssets = async () => {
      console.log('[App] Auth status is READY or SDK is ready, fetching assets...');
      await assetsStore.init();
      await NFTStore.init();
    };

    if (canShowDashboard) {
      fetchAssets().catch((error) => {
        console.error('[App] Error fetching assets:', error);
      });
    }
  }, [canShowDashboard, assetsStore, NFTStore]);

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
              <Route path="*" element={<Navigate to={lastVisitedPage ? lastVisitedPage : 'assets'} />} />
            </>
          ) : (
            <>
              <Route path="login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="login" />} />
            </>
          )}
        </Routes>
      </ContentStyled>
    </RootStyled>
  );
});
