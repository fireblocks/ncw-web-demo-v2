import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage } from '@pages';
import { useFireblocksSDKStore, useUserStore } from '@store';
import { observer } from 'mobx-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreInitializer } from './StoreInitializer';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  backgroundColor: theme.palette.primary.main,
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
  const fireblocksSDKStore = useFireblocksSDKStore();
  const lastVisitedPage = localStorage.getItem('VISITED_PAGE');
  const canShowDashboard = fireblocksSDKStore.keysAreReady && userStore.loggedUser;

  return (
    <RootStyled>
      <ContentStyled>
        {userStore.loggedUser && <StoreInitializer />}
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
