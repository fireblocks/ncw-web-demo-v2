import React from 'react';
import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage } from '@pages';
import { useAssetsStore, useAuthStore, useNFTStore, useTransactionsStore, useUserStore } from '@store';
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
