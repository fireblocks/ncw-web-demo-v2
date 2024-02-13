import { Typography, styled } from '@foundation';
import { AssetsPage, LoginPage, NFTsPage, Navigation, SettingsPage, TransactionsPage } from '@pages';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';

const RootStyled = styled('div')(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const App: React.FC = observer(function App() {
  const userStore = useUserStore();

  if (!userStore.storeIsReady) {
    return null;
  }

  return (
    <RootStyled>
      <Typography variant="h1" color="text.primary">
        {userStore.loggedUser ? `Hello ${userStore.userDisplayName}! Im web demo` : 'Hello im web demo'}
      </Typography>

      <Navigation />
      <Routes>
        <Route path="login" element={<LoginPage />} />

        {userStore.loggedUser && (
          <>
            <Route path="assets" element={<AssetsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="nft" element={<NFTsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </>
        )}

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </RootStyled>
  );
});
