import { styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Header, SettingsPage, TransactionsPage } from '@pages';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';
import { StoreInitializer } from './StoreInitializer';

const RootStyled = styled('div')(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.primary.main,
}));

const ContentStyled = styled('div')(() => ({
  maxWidth: 1440,
  margin: '0 auto',
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
          <Route path="login" element={<LoginPage />} />

          {userStore.loggedUser && (
            <>
              <Route path="assets" element={<AssetsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="nfts" element={<NFTsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </>
          )}

          <Route path="*" element={<LoginPage />} />
        </Routes>
      </ContentStyled>
    </RootStyled>
  );
});
