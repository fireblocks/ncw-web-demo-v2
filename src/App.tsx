import { Typography, styled } from '@foundation';
import { AssetsPage, NFTsPage, Navigation, SettingsPage, TransactionsPage } from '@pages';
import { observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';

const RootStyled = styled('div')(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const App = observer(function App() {
  return (
    <RootStyled>
      <Typography variant="h1" color="text.primary">
        Hello im web demo
      </Typography>

      <Navigation />
      <Routes>
        <Route path="assets" element={<AssetsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="nft" element={<NFTsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<AssetsPage />} />
      </Routes>
    </RootStyled>
  );
});
