import React from 'react';
import {
  IconButton,
  ModeSwitcher,
  Progress,
  SearchInput,
  TViewMode,
  Typography,
  styled,
  LoadingPage,
} from '@foundation';
import IconRefresh from '@icons/refresh.svg';
import { NFTTokenStore, useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { ActionsBoxWrapperStyled, ActionsWrapperStyled, SearchWrapperStyled } from '../common/ActionsBox';
import { EmptyPage } from '../common/EmptyPage';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { NFTCards } from './Cards/NFTCards';
import { NewTransactionDialog } from './NewTransactionDialog/NewTransactionDialog';
import { NFTsList } from './Table/NFTsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(4, 0, 9, 0),
}));

export const NFTsPage: React.FC = observer(function NFTsPage() {
  const preselectedViewMode = localStorage.getItem('NFT_VIEW_MODE') ?? 'CARD';
  const NFTStore = useNFTStore();
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<TViewMode>(preselectedViewMode as TViewMode);
  const [query, setQuery] = React.useState('');
  const [selectedTokenId, setSelectedTokenId] = React.useState<string | null>(null);
  const [selectedTokenStore, setSelectedTokenStore] = React.useState<NFTTokenStore | undefined>(undefined);
  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = React.useState(false);

  localStorage.setItem('VISITED_PAGE', 'nfts');

  const onSetMode = (viewMode: TViewMode) => {
    setMode(viewMode);
    localStorage.setItem('NFT_VIEW_MODE', viewMode);
  };

  const onNewTransactionDialogClose = () => {
    setIsNewTransactionDialogOpen(false);
  };

  const onNewTransactionDialogOpen = () => {
    setIsNewTransactionDialogOpen(true);
    if (selectedTokenId) {
      setSelectedTokenStore(NFTStore.get(selectedTokenId));
    }
  };

  if (NFTStore.isLoading) {
    return <LoadingPage />;
  }

  return (
    <RootStyled>
      {NFTStore.tokens.length === 0 && !NFTStore.isLoading ? (
        <EmptyPage page="NFT" />
      ) : (
        <>
          <HeadingStyled>
            <Typography variant="h5" color="text.primary">
              {t('NFT.TITLE')}
            </Typography>
            <AmountsStyled>
              <HeadingAmount title={t('NFT.ITEMS')} titleColor="text.secondary" value={NFTStore.tokens.length} />
              <HeadingAmount
                title={t('NFT.COLLECTIONS')}
                titleColor="text.secondary"
                value={NFTStore.collections.length}
              />
            </AmountsStyled>
          </HeadingStyled>
          <ActionsBoxWrapperStyled>
            <SearchWrapperStyled>
              <SearchInput query={query} setQuery={setQuery} placeholder={t('NFT.SEARCH')} />
            </SearchWrapperStyled>
            <ActionsWrapperStyled>
              <ModeSwitcher value={mode} onChange={onSetMode} />
              <IconButton
                disabled={NFTStore.isRefreshingGallery}
                tooltip={t('NFT.REFRESH_GALLERY')}
                onClick={() => {
                  NFTStore.getTokens().catch(() => {});
                }}
              >
                {NFTStore.isRefreshingGallery ? <Progress size="small" /> : <img src={IconRefresh} />}
              </IconButton>
            </ActionsWrapperStyled>
          </ActionsBoxWrapperStyled>
          {mode === 'TABLE' ? (
            <NFTsList
              onNewTransactionDialogOpen={onNewTransactionDialogOpen}
              selectedTokenId={selectedTokenId}
              setSelectedTokenId={setSelectedTokenId}
              query={query}
            />
          ) : (
            <NFTCards
              onNewTransactionDialogOpen={onNewTransactionDialogOpen}
              setSelectedTokenId={setSelectedTokenId}
              query={query}
            />
          )}

          <NewTransactionDialog
            isOpen={isNewTransactionDialogOpen}
            onClose={onNewTransactionDialogClose}
            token={selectedTokenStore}
          />
        </>
      )}
    </RootStyled>
  );
});
