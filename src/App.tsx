import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage } from '@pages';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreInitializer } from './StoreInitializer';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  backgroundColor: theme.palette.primary.main,
  paddingBottom: theme.spacing(4),
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

  if (!userStore.storeIsReady) {
    return null;
  }

  return (
    <RootStyled>
      <ContentStyled>
        {userStore.loggedUser && <StoreInitializer />}
        <Header />
        <Routes>
          {userStore.loggedUser ? (
            <>
              <Route path="assets" element={<AssetsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="nfts" element={<NFTsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/assets" />} />
            </>
          ) : (
            <>
              <Route path="login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </ContentStyled>
    </RootStyled>
  );
});
