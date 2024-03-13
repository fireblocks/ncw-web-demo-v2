import React from 'react';
import { ModeSwitcher, Skeleton, TViewMode, Table, Typography, styled } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { ActionsBoxWrapperStyled, ActionsWrapperStyled } from '../common/ActionsBox';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
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
  const [mode, setMode] = React.useState<TViewMode>('TABLE');

  if (NFTStore.isLoading) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
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
        <div />
        <ActionsWrapperStyled>
          <ModeAndGroupingWrapperStyled>
            <ModeSwitcher value={mode} onChange={setMode} />
          </ModeAndGroupingWrapperStyled>
        </ActionsWrapperStyled>
      </ActionsBoxWrapperStyled>
      <NFTsList />
    </RootStyled>
  );
});
