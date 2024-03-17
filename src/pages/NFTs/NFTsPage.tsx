import React from 'react';
import {
  CircularProgress,
  IconButton,
  ModeSwitcher,
  SearchInput,
  Skeleton,
  TViewMode,
  Table,
  Typography,
  styled,
} from '@foundation';
import IconRefresh from '@icons/refresh.svg';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { ActionsBoxWrapperStyled, ActionsWrapperStyled, SearchWrapperStyled } from '../common/ActionsBox';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { NFTCards } from './Cards/NFTCards';
import { NFTsList } from './Table/NFTsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(7),
  height: 204,
}));

const ModeAndGroupingWrapperStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(1.1, 0),
}));

export const NFTsPage: React.FC = observer(function NFTsPage() {
  const NFTStore = useNFTStore();
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<TViewMode>('CARD');
  const [query, setQuery] = React.useState('');

  if (NFTStore.isLoading) {
    return (
      <Table>
        <Skeleton mode="CARDS" />
      </Table>
    );
  }

  return (
    <RootStyled>
      <HeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('NFT.TITLE')}
        </Typography>
        <AmountsStyled>
          <HeadingAmount title={t('NFT.ITEMS')} titleColor="text.secondary" value={NFTStore.tokens.length} />
          <HeadingAmount title={t('NFT.COLLECTIONS')} titleColor="text.secondary" value={NFTStore.collections.length} />
        </AmountsStyled>
      </HeadingStyled>
      <ActionsBoxWrapperStyled>
        <SearchWrapperStyled>
          <SearchInput query={query} setQuery={setQuery} placeholder={t('NFT.SEARCH')} />
        </SearchWrapperStyled>
        <ActionsWrapperStyled>
          <ModeAndGroupingWrapperStyled>
            <ModeSwitcher value={mode} onChange={setMode} />
          </ModeAndGroupingWrapperStyled>
          <IconButton
            disabled={NFTStore.isRefreshingGallery}
            tooltip={t('NFT.REFRESH_GALLERY')}
            onClick={() => {
              NFTStore.getTokens();
            }}
          >
            {NFTStore.isRefreshingGallery ? (
              <CircularProgress
                sx={{
                  color: (theme) => theme.palette.text.primary,
                }}
                size={14}
                thickness={6}
              />
            ) : (
              <img src={IconRefresh} />
            )}
          </IconButton>
        </ActionsWrapperStyled>
      </ActionsBoxWrapperStyled>
      {mode === 'TABLE' ? <NFTsList query={query} /> : <NFTCards query={query} />}
    </RootStyled>
  );
});
