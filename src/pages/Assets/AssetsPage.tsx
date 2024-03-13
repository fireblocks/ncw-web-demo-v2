import React from 'react';
import { Typography, styled } from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { AmountsStyled, HeadingAmount } from '../common/HeadingAmount';
import { AssetsList } from './AssetsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(7),
  height: 204,
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
        <AmountsStyled>
          <HeadingAmount
            title={t('ASSETS.CURRENT_BALANCE')}
            titleColor="text.secondary"
            value={assetsStore.isLoading ? t('COMMON.LOADING') : assetsStore.totalAvailableBalanceInUSD}
          />
        </AmountsStyled>
      </HeadingStyled>
      <AssetsList />
    </RootStyled>
  );
});
