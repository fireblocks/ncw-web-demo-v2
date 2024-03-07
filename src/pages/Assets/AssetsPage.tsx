import React from 'react';
import { Typography, styled } from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { AssetsList } from './AssetsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const BalanceStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  margin: theme.spacing(5, 0, 8, 0),
}));

export const AssetsPage: React.FC = observer(function AssetsPage() {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();

  return (
    <RootStyled>
      <HeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('ASSETS.TITLE')}
        </Typography>
        <BalanceStyled>
          <Typography variant="h6" color="text.secondary">
            {t('ASSETS.CURRENT_BALANCE')}
          </Typography>
          <Typography variant="h1" color="text.primary">
            {assetsStore.isLoading ? t('COMMON.LOADING') : assetsStore.totalAvailableBalanceInUSD}
          </Typography>
        </BalanceStyled>
      </HeadingStyled>
      <AssetsList />
    </RootStyled>
  );
});
