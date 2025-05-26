import React from 'react';
import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage, Web3Page } from '@pages';
import { useAssetsStore, useAuthStore, useNFTStore, useTransactionsStore, useUserStore } from '@store';
import { ENV_CONFIG } from 'env_config';
import { observer } from 'mobx-react';
import { Routes, Route, Navigate } from 'react-router-dom';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  backgroundColor: theme.palette.background.default,
}));

const ContentStyled = styled('div')(() => ({
  maxWidth: 1440,
  width: '100%',
  maxHeight: '100vh',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowX: 'auto',
}));

export const App: React.FC = observer(function App() {
  const userStore = useUserStore();
  const transactionsStore = useTransactionsStore();
  const authStore = useAuthStore();
  const assetsStore = useAssetsStore();
  const NFTStore = useNFTStore();
  const lastVisitedPage = localStorage.getItem('VISITED_PAGE');
  const canShowDashboard = authStore.status === 'READY' && userStore.loggedUser;

  React.useEffect(
    () => () => {
      transactionsStore.dispose();
    },
    [transactionsStore],
  );

  React.useEffect(() => {
    if (userStore.userId) {
      authStore.init().catch(() => {});
    }
  }, [userStore.userId, authStore]);

  React.useEffect(() => {
    const fetchAssets = async () => {
      await assetsStore.init();
      await NFTStore.init();
    };

    if (authStore.status === 'READY') {
      fetchAssets().catch(() => {});
    }
  }, [authStore.status, assetsStore, NFTStore]);

  return (
    <RootStyled>
      <ContentStyled>
        {canShowDashboard && <Header />}
        <Routes>
          {canShowDashboard ? (
            <>
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="assets" element={<Navigate to="/assets" />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="transactions" element={<Navigate to="/transactions" />} />
              <Route path="/nfts" element={<NFTsPage />} />
              <Route path="nfts" element={<Navigate to="/nfts" />} />
              {ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && (
                <>
                  <Route path="/web3" element={<Web3Page />} />
                  <Route path="web3" element={<Navigate to="/web3" />} />
                </>
              )}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="settings" element={<Navigate to="/settings" />} />
              <Route
                path="*"
                element={
                  <Navigate
                    to={(() => {
                      if (!lastVisitedPage) {
                        return '/assets';
                      }
                      return lastVisitedPage.startsWith('/') ? lastVisitedPage : `/${lastVisitedPage}`;
                    })()}
                  />
                }
              />
            </>
          ) : (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="login" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </ContentStyled>
    </RootStyled>
  );
});
