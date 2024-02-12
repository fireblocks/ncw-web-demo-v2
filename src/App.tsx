import { styled } from '@foundation';
import { AssetsPage, NFTsPage, Navigation, SettingsPage, TransactionsPage } from '@pages';
import { observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#eeeeee',
}));

export const App = observer(function App() {
  return (
    <RootStyled>
      Hello im web demo
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
